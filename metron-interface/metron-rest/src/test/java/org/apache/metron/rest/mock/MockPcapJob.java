/*
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
package org.apache.metron.rest.mock;

import org.apache.hadoop.fs.Path;
import org.apache.metron.job.Finalizer;
import org.apache.metron.job.JobException;
import org.apache.metron.job.JobStatus;
import org.apache.metron.job.Pageable;
import org.apache.metron.job.Statusable;
import org.apache.metron.pcap.config.PcapOptions;
import org.apache.metron.pcap.filter.PcapFilterConfigurator;
import org.apache.metron.pcap.mr.PcapJob;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class MockPcapJob extends PcapJob<Path> {

  private String basePath;
  private String baseInterrimResultPath;
  private String finalOutputPath;
  private long startTimeNs;
  private long endTimeNs;
  private int numReducers;
  private Map<String, String> fixedFields;
  private PcapFilterConfigurator filterImpl;
  private int recPerFile;
  private String query;
  private Statusable<Path> statusable;

  public MockPcapJob() {
    statusable = mock(Statusable.class);
  }

  @Override
  public Statusable<Path> submit(Finalizer<Path> finalizer, Map<String, Object> configuration) throws JobException {
    when(statusable.getConfiguration()).thenReturn(new HashMap<>(configuration));
    this.basePath = PcapOptions.BASE_PATH.get(configuration, String.class);
    this.baseInterrimResultPath = PcapOptions.BASE_INTERIM_RESULT_PATH.get(configuration, String.class);
    this.finalOutputPath = PcapOptions.FINAL_OUTPUT_PATH.get(configuration, String.class);
    this.startTimeNs = PcapOptions.START_TIME_MS.get(configuration, Long.class) * 1000000;
    this.endTimeNs = PcapOptions.END_TIME_MS.get(configuration, Long.class) * 1000000;
    this.numReducers = PcapOptions.NUM_REDUCERS.get(configuration, Integer.class);
    Object fields = PcapOptions.FIELDS.get(configuration, Object.class);
    if (fields instanceof Map) {
      this.fixedFields = (Map<String, String>) fields;
    } else {
      this.query = (String) fields;
    }
    this.filterImpl = PcapOptions.FILTER_IMPL.get(configuration, PcapFilterConfigurator.class);
    this.recPerFile = PcapOptions.NUM_RECORDS_PER_FILE.get(configuration, Integer.class);
    return statusable;
  }

  @Override
  public JobStatus getStatus() throws JobException {
    return statusable.getStatus();
  }

  @Override
  public Pageable<Path> get() throws JobException, InterruptedException {
    return statusable.get();
  }

  public void setStatus(JobStatus jobStatus) throws JobException {
    when(statusable.getStatus()).thenReturn(jobStatus);
  }

  public void setPageable(Pageable<Path> pageable) throws JobException, InterruptedException {
    when(statusable.get()).thenReturn(pageable);
  }

  public void setIsDone(boolean isDone) {
    when(statusable.isDone()).thenReturn(isDone);
  }

  public String getBasePath() {
    return basePath;
  }

  public void setBasePath(String basePath) {
    this.basePath = basePath;
  }

  public String getBaseInterrimResultPath() {
    return baseInterrimResultPath;
  }

  public void setBaseInterrimResultPath(String baseInterrimResultPath) {
    this.baseInterrimResultPath = baseInterrimResultPath;
  }

  public String getFinalOutputPath() {
    return finalOutputPath;
  }

  public void setFinalOutputPath(String finalOutputPath) {
    this.finalOutputPath = finalOutputPath;
  }

  public long getStartTimeNs() {
    return startTimeNs;
  }

  public long getEndTimeNs() {
    return endTimeNs;
  }

  public int getNumReducers() {
    return numReducers;
  }

  public Map<String, String> getFixedFields() {
    return fixedFields;
  }

  public String getQuery() {
    return query;
  }

  public PcapFilterConfigurator getFilterImpl() {
    return filterImpl;
  }

  public int getRecPerFile() {
    return recPerFile;
  }
}
