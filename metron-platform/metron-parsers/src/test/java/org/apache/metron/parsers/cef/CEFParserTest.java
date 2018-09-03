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

package org.apache.metron.parsers.cef;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jackson.JsonLoader;
import com.github.fge.jsonschema.core.report.ProcessingReport;
import com.github.fge.jsonschema.main.JsonSchemaFactory;
import com.github.fge.jsonschema.main.JsonValidator;
import com.google.common.io.Resources;

public class CEFParserTest {

	private static final Charset UTF_8 = Charset.forName("utf-8");
	private CEFParser parser;

	@Before
	public void setUp() {
		parser = new CEFParser();
		parser.init();
	}

	@Test
	public void testInvalid() {
		List<JSONObject> obj = parse("test test test nonsense\n");
		Assert.assertEquals(0, obj.size());
	}

	@Test
	public void testEscaping() {
		for (JSONObject obj : parse(
				"Sep 19 08:26:10 host CEF:0|security|threatmanager|1.0|100|detected a \\ in packet|10|src=10.0.0.1 act=blocked a \\ dst=1.1.1.1")) {
			Assert.assertEquals("10.0.0.1", obj.get("ip_src_addr"));
			Assert.assertEquals("blocked a \\", obj.get("deviceAction"));
			Assert.assertEquals("1.1.1.1", obj.get("ip_dst_addr"));
		}
	}

	@Test
	public void testBasicHeader() {
		for (JSONObject obj : parse(
				"CEF:0|Security|threatmanager|1.0|100|worm successfully stopped|10|src=10.0.0.1 dst=2.1.2.2 spt=1232")) {
			Assert.assertEquals("Security", obj.get("DeviceVendor"));
			Assert.assertEquals("threatmanager", obj.get("DeviceProduct"));
			Assert.assertEquals("1.0", obj.get("DeviceVersion"));
			Assert.assertEquals("100", obj.get("DeviceEvent"));
			Assert.assertEquals("worm successfully stopped", obj.get("Name"));
			Assert.assertEquals(10, obj.get("Severity"));
		}
	}

	@Test
	public void testBasicExtensions() {
		for (JSONObject obj : parse(
				"CEF:0|Security|threatmanager|1.0|100|worm successfully stopped|10|src=10.0.0.1 dst=2.1.2.2 spt=1232")) {
			Assert.assertEquals("10.0.0.1", obj.get("ip_src_addr"));
			Assert.assertEquals("2.1.2.2", obj.get("ip_dst_addr"));
			Assert.assertEquals(1232, obj.get("ip_src_port"));
		}
	}

	@Test
	public void testCustomLabelWithSpace() {
		for (JSONObject obj : parse(
				"CEF:0|Security|threatmanager|1.0|100|worm successfully stopped|10|src=10.0.0.1 dst=2.1.2.2 spt=1232 custom=Text with space customLabel=Label with space")) {
			Assert.assertEquals(true, obj.containsKey("Label with space"));
			Assert.assertEquals("Text with space", obj.get("Label with space"));
		}
	}

	@Test
	public void testTimestampPriority() throws java.text.ParseException {
		long correctTime = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSz").parse("2016-05-01T09:29:11.356-0400")
				.getTime();

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSz");

		for (JSONObject obj : parse(
				"CEF:0|Security|threatmanager|1.0|100|worm successfully stopped|10|src=10.0.0.1 rt=May 1 2016 09:29:11.356 -0400 dst=2.1.2.2 spt=1232")) {
			Assert.assertEquals(new Date(correctTime), new Date((long) obj.get("timestamp")));
			Assert.assertEquals(correctTime, obj.get("timestamp"));
		}
		for (JSONObject obj : parse(
				"2016-06-01T09:29:11.356-04:00 host CEF:0|Security|threatmanager|1.0|100|worm successfully stopped|10|src=10.0.0.1 rt=May 1 2016 09:29:11.356 -0400 dst=2.1.2.2 spt=1232")) {
			Assert.assertEquals(new Date(correctTime), new Date((long) obj.get("timestamp")));
			Assert.assertEquals(correctTime, obj.get("timestamp"));
		}
		for (JSONObject obj : parse(
				"2016-05-01T09:29:11.356-04:00 host CEF:0|Security|threatmanager|1.0|100|worm successfully stopped|10|src=10.0.0.1 dst=2.1.2.2 spt=1232")) {
			Assert.assertEquals(new Date(correctTime), new Date((long) obj.get("timestamp")));
			Assert.assertEquals(correctTime, obj.get("timestamp"));
		}
		for (JSONObject obj : parse(
				"CEF:0|Security|threatmanager|1.0|100|worm successfully stopped|10|src=10.0.0.1 dst=2.1.2.2 spt=1232")) {
			Assert.assertNotNull(obj.get("timestamp"));
		}

	}

	@Test
	public void testRtValueAsEpochTimestamp() throws java.text.ParseException {
		long correctTime = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSz").parse("2016-05-01T09:29:11.356-0400")
				.getTime();
		for (JSONObject obj : parse("CEF:0|Security|threatmanager|1.0|100|worm successfully stopped|10|src=10.0.0.1 rt="
				+ String.valueOf(correctTime) + " dst=2.1.2.2 spt=1232")) {
			Assert.assertEquals(new Date(correctTime), new Date((long) obj.get("timestamp")));
			Assert.assertEquals(correctTime, obj.get("timestamp"));
		}
	}

	private void runMissingYear(Calendar expected, Calendar input) {
		SimpleDateFormat sdf = new SimpleDateFormat("MMM dd HH:mm:ss.SSS");
		for (JSONObject obj : parse("CEF:0|Security|threatmanager|1.0|100|worm successfully stopped|10|src=10.0.0.1 rt="
				+ sdf.format(input.getTime()) + " dst=2.1.2.2 spt=1232")) {
			Assert.assertEquals(expected.getTimeInMillis(), obj.get("timestamp"));
			Assert.assertEquals(expected.getTime(), new Date((long) obj.get("timestamp")));
		}
	}

	@Test
	public void testMissingYearFromDate() throws java.text.ParseException {
		Calendar current = Calendar.getInstance();
		Calendar correct = Calendar.getInstance();

		correct.setTimeInMillis(current.getTimeInMillis());

		runMissingYear(correct, current);
	}

	@Test
	public void testFourDayFutureBecomesPast() {
		Calendar current = Calendar.getInstance();
		Calendar correct = Calendar.getInstance();

		current.add(Calendar.DAY_OF_MONTH, 5);
		// correct.setTime(current.getTime());
		correct.setTimeInMillis(current.getTimeInMillis());
		correct.add(Calendar.YEAR, -1);

		runMissingYear(correct, current);
	}

	@Test
	public void testCEFParserAdallom() throws Exception {
		runTest("adallom", Resources.readLines(Resources.getResource(getClass(), "adallom.cef"), UTF_8),
				Resources.toString(Resources.getResource(getClass(), "adallom.schema"), UTF_8));
	}

	@Test
	public void testCEFParserCyberArk() throws Exception {
		runTest("cyberark", Resources.readLines(Resources.getResource(getClass(), "cyberark.cef"), UTF_8),
				Resources.toString(Resources.getResource(getClass(), "cyberark.schema"), UTF_8),
				Resources.toString(Resources.getResource(getClass(), "cyberark.json"), UTF_8));
	}

	@Test
	public void testCEFParserWAF() throws Exception {
		URL waf_url = Resources.getResource(getClass(), "waf.cef");
		runTest("waf", Resources.readLines(waf_url, UTF_8),
				Resources.toString(Resources.getResource(getClass(), "waf.schema"), UTF_8));
	}

	@Test
	public void testPaloAltoCEF() throws Exception {
		URL palo_url = Resources.getResource(getClass(), "palo.cef");
		runTest("palo", Resources.readLines(palo_url, UTF_8),
				Resources.toString(Resources.getResource(getClass(), "palo.schema"), UTF_8));
	}

	private void runTest(String name, List<String> lines, String schema) throws Exception {
		runTest(name, lines, schema, "");
	}

	private void runTest(String name, List<String> lines, String schema, String targetJson) throws Exception {
		for (String inputString : lines) {
			JSONObject parsed = parse(inputString).get(0);
			Assert.assertNotNull(parsed);
			Assert.assertNotNull(parsed.get("timestamp"));
			Assert.assertTrue((long) parsed.get("timestamp") > 0);

			JSONParser parser = new JSONParser();

			Map<?, ?> json = null;
			try {
				json = (Map<?, ?>) parser.parse(parsed.toJSONString());
				Assert.assertEquals(true, validateJsonData(schema, json.toString()));
			} catch (ParseException e) {
				e.printStackTrace();
			}

			// test against an explicit json example
			if (!targetJson.isEmpty()) {

			}
		}
	}

	/**
	 * Additional Sample from NiFi test Suite
	 * (https://github.com/apache/nifi/blob/rel/nifi-1.1.1/nifi-nar-bundles/nifi
	 * -standard-bundle/nifi-standard-processors/src/test/java/org/apache/nifi/
	 * processors/standard/TestParseCEF.java)
	 */
	private final static String sample = "CEF:0|TestVendor|TestProduct|TestVersion|TestEventClassID|TestName|Low|" +
			// TimeStamp, String and Long
			"rt=Feb 09 2015 00:27:43 UTC cn3Label=Test Long cn3=9223372036854775807 " +
			// FloatPoint and MacAddress
			"cfp1=1.234 cfp1Label=Test FP Number smac=00:00:0c:07:ac:00 " +
			// IPv6 and String
			"c6a3=2001:cdba::3257:9652 c6a3Label=Test IPv6 cs1Label=Test String cs1=test test test chocolate " +
			// IPv4
			"destinationTranslatedAddress=123.123.123.123 " +
			// Date without TZ
			"deviceCustomDate1=Feb 06 2015 13:27:43 " +
			// Integer and IP Address (from v4)
			"dpt=1234 agt=123.123.0.124 dlat=40.366633 " +
			// A JSON object inside one of CEF's custom Strings
			"cs2Label=JSON payload "
			+ "cs2={\"test_test_test\": \"chocolate!\", \"what?!?\": \"Simple! test test test chocolate!\"}";

	@Test
	public void testSuccessfulWhenCEFContainsJSON() throws JsonProcessingException, IOException {
		List<JSONObject> parse = parse(sample);
		JSONObject obj = parse.get(0);

		Assert.assertEquals("TestVendor", obj.get("DeviceVendor"));
		Assert.assertEquals(1423441663000L, obj.get("timestamp"));
		Assert.assertEquals("9223372036854775807", obj.get("Test Long"));
		Assert.assertEquals(obj.get("Test FP Number"), String.valueOf(1.234F));
		Assert.assertEquals("00:00:0c:07:ac:00", obj.get("smac"));
		Assert.assertEquals("2001:cdba::3257:9652", obj.get("Test IPv6"));
		Assert.assertEquals("test test test chocolate", obj.get("Test String"));
		Assert.assertEquals("123.123.123.123", obj.get("destinationTranslatedAddress"));

		JsonNode inner = new ObjectMapper().readTree((String) obj.get("JSON payload"));
		Assert.assertEquals("chocolate!", inner.get("test_test_test").asText());
	}

	protected boolean validateJsonData(final String jsonSchema, final String jsonData) throws Exception {
		final JsonNode d = JsonLoader.fromString(jsonData);
		final JsonNode s = JsonLoader.fromString(jsonSchema);

		final JsonSchemaFactory factory = JsonSchemaFactory.byDefault();
		JsonValidator v = factory.getValidator();

		ProcessingReport report = v.validate(s, d);

		return report.toString().contains("success");
	}

	private List<JSONObject> parse(String string) {
		List<JSONObject> parse = parser.parse(string.getBytes(Charset.forName("utf-8")));
		Assert.assertNotNull(parse);
		return parse;
	}

}
