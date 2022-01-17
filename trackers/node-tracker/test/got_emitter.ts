/*
 * Copyright (c) 2022 Snowplow Analytics Ltd
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import test from 'ava';
import sinon from 'sinon';
import nock from 'nock';
import { HttpMethod, HttpProtocol, gotEmitter } from '../src/index';

const endpoint = 'd3rkrsqld9gmqf.cloudfront.net';

nock(new RegExp('https*://' + endpoint))
  .persist()
  .filteringPath(() => '/')
  .get('/')
  .reply(200, (uri) => uri);

nock(new RegExp('https*://' + endpoint))
  .matchHeader('content-type', 'application/json; charset=utf-8')
  .persist()
  .filteringRequestBody(() => '*')
  .post('/com.snowplowanalytics.snowplow/tp2', '*')
  .reply(200, (_uri, body: Record<string, unknown>) => (body['data'] as Array<unknown>)[0]);

test.before(() => {
  nock.disableNetConnect();
});

test.after(() => {
  nock.cleanAll();
});

test.cb('gotEmitter should send an HTTP GET request', (t) => {
  const e = gotEmitter(
    endpoint,
    HttpProtocol.HTTP,
    80,
    HttpMethod.GET,
    undefined,
    undefined,
    undefined,
    function (error, response) {
      t.regex(response?.body as string, /\/i\?.*a=b.*/);
      t.end(error);
    }
  );
  e.input({ a: 'b' });
});

test.cb('gotEmitter should send an HTTP POST request', (t) => {
  const e = gotEmitter(
    endpoint,
    HttpProtocol.HTTP,
    undefined,
    HttpMethod.POST,
    1,
    undefined,
    undefined,
    function (error, response) {
      t.like(JSON.parse(response?.body as string), { a: 'b' });
      t.end(error);
    }
  );
  e.input({ a: 'b' });
});

test.cb('gotEmitter should send an HTTPS GET request', (t) => {
  const e = gotEmitter(
    endpoint,
    HttpProtocol.HTTPS,
    443,
    HttpMethod.GET,
    undefined,
    undefined,
    undefined,
    function (error, response) {
      t.regex(response?.body as string, /\/i\?.*a=b.*/);
      t.end(error);
    }
  );
  e.input({ a: 'b' });
});

test.cb('gotEmitter should send an HTTPS POST request', (t) => {
  const e = gotEmitter(
    endpoint,
    HttpProtocol.HTTPS,
    undefined,
    HttpMethod.POST,
    1,
    undefined,
    undefined,
    function (error, response) {
      t.like(JSON.parse(response?.body as string), { a: 'b' });
      t.end(error);
    }
  );
  e.input({ a: 'b' });
});

test.cb('gotEmitter should not send requests if the buffer is not full', (t) => {
  const e = gotEmitter(endpoint, HttpProtocol.HTTPS, undefined, HttpMethod.POST, undefined, undefined, undefined, () =>
    t.fail('Event unexpectedly emitted')
  );
  e.input({});
  e.input({});
  e.input({});
  setTimeout(t.end, 250); //Give chance for emitter callback to fire
});

test.cb('gotEmitter should not send requests if the buffer is empty', (t) => {
  const e = gotEmitter(endpoint, HttpProtocol.HTTPS, undefined, HttpMethod.POST, undefined, undefined, undefined, () =>
    t.fail('Event unexpectedly emitted')
  );
  e.flush();
  setTimeout(t.end, 250); //Give chance for emitter callback to fire
});

test.cb('gotEmitter should add STM querystring parameter when sending POST requests', (t) => {
  const testTime = new Date('1988-12-12T12:30:00.000Z').getTime();
  const clock = sinon.useFakeTimers(testTime);

  const e = gotEmitter(
    endpoint,
    HttpProtocol.HTTP,
    undefined,
    HttpMethod.POST,
    1,
    undefined,
    undefined,
    function (error, response) {
      t.like(JSON.parse(response?.body as string), { stm: testTime.toString() });
      t.end(error);
    }
  );
  e.input({ a: 'b' });

  clock.restore();
});

test.cb('gotEmitter should add STM querystring parameter when sending GET requests', (t) => {
  const testTime = new Date('2020-06-15T09:12:30.000Z').getTime();
  const clock = sinon.useFakeTimers(testTime);

  const e = gotEmitter(
    endpoint,
    HttpProtocol.HTTPS,
    443,
    HttpMethod.GET,
    undefined,
    undefined,
    undefined,
    function (error, response) {
      t.regex(response?.body as string, new RegExp(`/i?.*stm=${testTime}.*`));
      t.end(error);
    }
  );
  e.input({ a: 'b' });

  clock.restore();
});

test.cb('gotEmitter should handle undefined callbacks on success situation', (t) => {
  t.notThrows(() => {
    const e = gotEmitter(endpoint, HttpProtocol.HTTPS, 443, HttpMethod.GET, undefined, undefined, undefined, undefined);
    e.input({ a: 'b' });
  });
  t.end();
});

test.cb('gotEmitter should handle undefined callbacks on failure situation', (t) => {
  t.notThrows(() => {
    const e = gotEmitter('invalid-url', HttpProtocol.HTTPS, 443, HttpMethod.POST, 1, undefined, undefined, undefined);
    e.input({ a: 'b' });
  });
  t.end();
});

test.cb('gotEmitter should catch error in success situation', (t) => {
  t.notThrows(() => {
    const e = gotEmitter(
      endpoint,
      HttpProtocol.HTTPS,
      443,
      HttpMethod.GET,
      undefined,
      undefined,
      undefined,
      function () {
        throw new Error('test error');
      }
    );
    e.input({ a: 'b' });
  });
  t.end();
});

test.cb('gotEmitter should catch error in error situation', (t) => {
  t.notThrows(() => {
    const e = gotEmitter('invalid-url', HttpProtocol.HTTPS, 443, HttpMethod.POST, 1, undefined, undefined, function () {
      throw new Error('test error');
    });
    e.input({ a: 'b' });
  });
  t.end();
});

test.cb('gotEmitter should pass response in success situation', (t) => {
  const e = gotEmitter(
    endpoint,
    HttpProtocol.HTTPS,
    443,
    HttpMethod.GET,
    undefined,
    undefined,
    undefined,
    function (error, response) {
      t.falsy(error);
      t.truthy(response);
      t.end();
    }
  );
  e.input({ a: 'b' });
});

test.cb('gotEmitter should pass error in error situation', (t) => {
  const e = gotEmitter(
    'invalid-url',
    HttpProtocol.HTTPS,
    443,
    HttpMethod.POST,
    1,
    undefined,
    undefined,
    function (error, response) {
      t.truthy(error);
      t.falsy(response);
      t.end();
    }
  );
  e.input({ a: 'b' });
});
