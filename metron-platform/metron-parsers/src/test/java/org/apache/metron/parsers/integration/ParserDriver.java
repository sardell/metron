/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.metron.parsers.integration;

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import org.apache.commons.lang.SerializationUtils;
import org.apache.metron.common.configuration.FieldValidator;
import org.apache.metron.common.configuration.ParserConfigurations;
import org.apache.metron.common.configuration.SensorParserConfig;
import org.apache.metron.common.configuration.writer.WriterConfiguration;
import org.apache.metron.common.utils.JSONUtils;
import org.apache.metron.common.utils.ReflectionUtils;
import org.apache.metron.common.writer.MessageWriter;
import org.apache.metron.integration.ProcessorResult;
import org.apache.metron.parsers.bolt.ParserBolt;
import org.apache.metron.parsers.bolt.WriterHandler;
import org.apache.metron.parsers.topology.ParserComponents;
import org.apache.storm.task.OutputCollector;
import org.apache.storm.tuple.Tuple;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ParserDriver implements Serializable {
  private static final Logger LOG = LoggerFactory.getLogger(ParserBolt.class);
  public static class CollectingWriter implements MessageWriter<JSONObject>{
    List<byte[]> output;
    public CollectingWriter(List<byte[]> output) {
      this.output = output;
    }

    @Override
    public void init() {

    }

    @Override
    public void write(String sensorType, WriterConfiguration configurations, Tuple tuple, JSONObject message) throws Exception {
      output.add(message.toJSONString().getBytes());
    }

    @Override
    public String getName() {
      return "collecting";
    }

    @Override
    public void close() throws Exception {
    }

    public List<byte[]> getOutput() {
      return output;
    }
  }

  private class ShimParserBolt extends ParserBolt {
    List<byte[]> output;
    List<byte[]> errors = new ArrayList<>();

    public ShimParserBolt(List<byte[]> output) {
      super(null
          , Collections.singletonMap(
              sensorType == null ? config.getSensorTopic() : sensorType,
              new ParserComponents(
              ReflectionUtils.createInstance(config.getParserClassName()),
                  null,
                  new WriterHandler(new CollectingWriter(output))
              )
         )
      );
      this.output = output;
      Map<String, ParserComponents> sensorToComponentMap = getSensorToComponentMap();
      for(Entry<String, ParserComponents> sensorToComponents : sensorToComponentMap.entrySet()) {
        sensorToComponents.getValue().getMessageParser().configure(config.getParserConfig());
      }
    }

    @Override
    public ParserConfigurations getConfigurations() {
      return new ParserConfigurations() {
        @Override
        public SensorParserConfig getSensorParserConfig(String sensorType) {
          return config;
        }

        @Override
        public Map<String, Object> getGlobalConfig() {
          return globalConfig;
        }

        @Override
        public List<FieldValidator> getFieldValidations() {
          return new ArrayList<>();
        }
      };
    }

    @Override
    protected void prepCache() {
    }

    @Override
    protected void handleError(byte[] originalMessage, Tuple tuple, Throwable ex, OutputCollector collector) {
      errors.add(originalMessage);
      LOG.error("Error parsing message: " + ex.getMessage(), ex);
    }

    public ProcessorResult<List<byte[]>> getResults() {
      return new ProcessorResult.Builder<List<byte[]>>().withProcessErrors(errors)
                                                        .withResult(output)
                                                        .build();

    }
  }


  private SensorParserConfig config;
  private Map<String, Object> globalConfig;
  private String sensorType;

  public ParserDriver(String sensorType, String parserConfig, String globalConfig) throws IOException {
    config = SensorParserConfig.fromBytes(parserConfig.getBytes());
    this.sensorType = sensorType;
    this.globalConfig = JSONUtils.INSTANCE.load(globalConfig, JSONUtils.MAP_SUPPLIER);
  }

  public ProcessorResult<List<byte[]>> run(Iterable<byte[]> in) {
    ShimParserBolt bolt = new ShimParserBolt(new ArrayList<>());
    byte[] b = SerializationUtils.serialize(bolt);
    ShimParserBolt b2 = (ShimParserBolt) SerializationUtils.deserialize(b);
    OutputCollector collector = mock(OutputCollector.class);
    bolt.prepare(null, null, collector);
    for(byte[] record : in) {
      bolt.execute(toTuple(record));
    }
    return bolt.getResults();
  }

  public Tuple toTuple(byte[] record) {
    Tuple ret = mock(Tuple.class);
    when(ret.getBinary(eq(0))).thenReturn(record);
    return ret;
  }

}
