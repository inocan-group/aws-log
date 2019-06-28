# AWS Log

The **aws-log** module is intended for AWS serverless functions to use as their exclusive
way to write to STDOUT and STDERR. By using using this library you will:

- be assured that all data sent to your logging solution will be as structured JSON string
- contextual information will be sent along with the details of that log message
- automatic creation of a correlation-id for cross-function tracing
- your "shipper" function will be able to filter log messages based on configured
  "severity"

## Installing

In your project root add the Log Shipper module:

```sh
# npm
npm install -s aws-log
# yarn
yarn add aws-log
```

## Logging

Now that the dependendency is installed you can import it in your code like so:

```typescript
import { logger } from "aws-log";
const log = logger();

log.info("this is a log message", { foo: 1, bar: 2 });
```

In this simple example this will produce the following output to STDOUT:

```json
{
  "@x-correlation-id": "1234-xyzd-abcd",
  "@severity": 1,
  "message": "this is a log message",
  "foo": 1,
  "bar": 2
}
```

Things to note about usage:

- You must call the `logger()` function to get the primary logging functions which are:
  `info`, `debug`, `warn` and `error`
- we ALWAYS get a JSON object as a return (good for logging frameworks)
- The first calling parameter is mapped to the `message` parameter in the output
- The second calling parameter is _optional_ but allows you to add other structured
- attributes which help to define the log message
- Every message will have a `@severity` attached to it. This is one-to-one mapped to which
  log function you choose:

  ```javascript
  {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };
  ```

- Every message will have a `@x-correlation-id` attached to it ... more on that later

  > **Note:** while there is no "timestamp" attribute appended we leave that off because
  > AWS includes the timestamp by default on each log entry. Please do ensure your
  > _shipper_ function picks up the timestamp and adds it into the JSON payload.

## Context

While each log message has unique data which you will want to log, there is also "context"
that when placed next to the specific message can make the data much more searchable and
thereby more useful. This idea of _context_ will be broken into two parts:

- **Global Context:** context that is relevant for the full execution of the function and
  and withe paramters you would never expect to be overwritten by the local logging.
- **Local Context:** context which may only be relavent for a shorter period or _might_
  be  
  overwritten by the local logging event.

### Global Context

There are a two primary ways to set global context but here's the most basic:

```typescript
const log = logger().context({ foo: "bar" });
log.info("this is a log message", { foo: 1, bar: 2 });
```

In this example the output would be:

```json
{
  "@x-correlation-id": "1234-xyzd-abcd",
  "@severity": 1,
  "@timestamp": 2234234,
  "message": "this is a log message",
  "foo": 1,
  "bar": 2,
  "context": {
    "foo": "bar"
  }
}
```

Every call to `debug`, `info`, `warn` and `error` will now always include the properties
you have passed in as **context**.

> Note: If your specific log content includes a property `context` then the logger will
> rename it to `_context_`. It is important for function-to-function consistency that the
> meaning of "context" remain consistent.

### Global Context in AWS Lambda

The signature of a Lambda function looks like this:

```typescript
export function handler(event, context) { ... }
```

In order to provide consistent "context" in Lambda functions as described above we suggest
you initialize your logging functions like so:

```typescript
const { log, debug, info, warn, error } = logger().lambda(event, context);
```

This allows for "smart" extraction of context. By _smart_ we mean that typically there are
two distinct types of Lambda execution:

1. Functions called from API Gateway (aka, an external API endpoint)
2. Functions called from other functions

The main difference in these two situations is in the data passed in as the **event**. In
the case of an API-Gateway call, the event has lots of meta-data travelling with it. For a
complete list refer to
[Lambda Proxy Request](https://github.com/lifegadget/common-types/blob/master/src/aws.ts#L76-L131).
The quick summary is that it passes the client's "query parameters", "path parameters" and
"body" of the message. This makes up the distinct "request" that will be considered in
your functions but it also passes a bunch of variant data about the client such as "what
browser?", "which geography?", etc. For a normal lambda-to-lambda function call the
"event" is exactly what the calling function passed in.

The `context` object is largely the same between the two types of Lambda's mentioned above
but in both cases provides some useful meta-data for logging. For those interested the
full typeing is here:
[IAWSLambaContext](https://github.com/lifegadget/common-types/blob/master/src/aws.ts#L133-L170).

All this information, regardless of which type of function it is, becomes "background
knowledge" as `aws-log` will take care of all the contextual information for you if you
use `.lambda(event, context)`, providing you with the following attributes on your context
property:

```typescript
/** the REST command (e.g., GET, PUT, POST, DELETE) */
httpMethod: string;
/** the path to the endpoint called */
path: string;
/** query parameters; aka, the name-value pairs after the "&" character */
queryStringParameters: string;
/** parameters passed in via the path itself */
pathParameters: string;
/** the callers user agent string */
userAgent: string;
/** the country which the request hit Cloundfront */
country: string;
/** the function handler which led to this log message */
functionName: string;
functionVersion: string;
/** the cloudwatch log group where the log was sent */
logStreamName: string;
/** the AWS requestId which is unique for this function call */
requestId: string;
/** the version from package.json file (for serverless function, not other libs) */
packageVersion: string;
```

### Lambda Context outside of Handler Function

We've already discussed the utility of passing the `event` and `context` attributes to the
logger and in the handler function we have a simple way of achieving this as these two
objects are immediately available:

```typescript
export function handler(event, context) {
  const log = logger().lambda(event, context);
  // ...
}
```

But unless we keep passing around the `event` and `context` how would we maintain context
in logging that's in a utility function, etc.? The answer is after the context has been
set with `logger().lambda(event, context)` you can simply write:

```typescript
const log = logger().reloadContext();
function doSomething() {
  log.info("something has happened");
}
```

### More Context

The original, and generic, `logger.context(obj)` method allowed us to add whatever
name/value pairs we pleased but with `logger.lambda(event, context)` we rely on
**aws-log** to choose context for us. This is probably good enough for most situations but
wherever you want to add more you can do so easily enough:

```typescript
// in the handler function
const log = logger().lambda(event, context, moreContext);
// somewhere else
const log = logger().reloadContext(moreContext);
```

> **NOTE:** that while both signatures are valid, the first one is STRONGLY recommended
> because "context" is meant to be information which is valid for the full execution of
> the function. Typically we'd expect this to be established as the first line of the
> handler function not later in the execution.

## Correlation ID

The correlation ID -- which shows up as `@x-correlation-id` in the log entry -- is an ID
who's scope is meant to stay consistent for a whole _graph_ or _fan out_ of function
executions. This scoping is SUPER useful as within AWS most logging is isolated to a
single function execution but in a micro-services architecture this often represents too
narrow a view.

The way the correlation ID is set is when "context" is provided -- typically via the
`lambda(event, context)` parameters -- it looks for a property `x-correlation-id` in the
"headers" property of the event. This means that if you are originating a request via
API-Gateway, you _can_ pass in this value as part of the request. In fact, it is _often_
the case that graph of function executions does originate from API-Gateway but even in
this situation we typically suggest the client does not send in a correlation ID unless
there is a chain of logging that preceeded this call on the client side. In most cases,
the absence of a correlation ID results in one being created automatically. Once it is
created though it must be _forwarded_ to all other executions downstream. This is achieved
via a helper method provided by this library called `invoke`.

## ENV filtering

While in development you almost always want ALL log entries to make it to your logging solution, this is not always the case when your in production (or other environments). For this reason `aws-log` provides a means to configure what logs should  be sent. Options include:

- `all` - all logs of a given log level should be sent to stdout
- `none` - no logs of a given log level should be sent
- `sample-by-session` - when initializing a function, a sampling rate is sampled and if within the bounds then all messages of a given log level will be sampled for that session (aka, as long as this logger stays in memory)
- `sample-by-event` - when an log event is encountered, the sampling rate is sampled and if within the sampling window it is logged.

Filtering based on the environment is set by default based on the value of the `AWS_STAGE` environment variable. The defaults  turn on logging for *all* events in DEV/TEST but block _debug_ logs and only sample logs at the _info_ level in STAGE/PROD. The default sampling rate is 10%.

If you'd like to set your own than you can by passing in the configuration as part of call to `logger( config )`. You can explicitly state the configuration you want or you can just state a "delta" off of the default configuration:

> **Delta Config:** changes sampling rate to 25% when in STAGE/PROD

```typescript
const config: IAwsLogConfig = { sampleRate: .25 }
const log = logger(config);
```

> **Full Config:** explicitly state config; it is assumed that caller has considered the ENV

```typescript
const config: IAwsLogConfig = { debug: "none", info: "none", warn: "all", error: "all" }
const log = logger(config);
```

## Keeping Secrets

Logging is great until you start logging secrets. This is a common problem so `aws-log` has features to help you avoid this:

- `addToMaskedValues(...values: string)` - adds one or more values to the "masked" category
- `setMaskedValues(...values: string)` - same as `addToMaskedValues` but instead of _adding_ it sets the masked values (removing any previously set values)

Once you've stated the *values* which should be masked you should consider the masking "strategy"; the strategies available are:

- `astericksWidthFixed`
- `astericksWidthDynamic`
- `revealEnd4`
- `revealStart4`

All masked values will default to a single strategy which is by default `astericksWidthDynamic`. You can also override the default strategy by passing in tuple of the form of `[value, strategy]` when setting the value with `addToMaskedValues`/`setMaskedValues`; for example:

```typescript
const log = logger().mask('abcd', 'efghi', [ 'foobar', "revealEnd4" ])
```

In this example the first two values will pickup and use the default strategy but the value "foobar" will be masked usin the "revealEnd4" strategy.

## The `invoke` Function

The standard way of calling a Lambda functon from within a Lambda is through the
[invoke](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property)
method of the AWS Lambda interface:

```typescript
import { Lambda } from "aws-sdk";
const lambda = new Lambda({ region: "us-east-1" });
lambda.invoke(params, fn(err, data) { ... });
```

As a convenience, this library provides `invoke` which provides the same functionality but
with a simplified calling structure:

```typescript
import { invoke } from "aws-log";
try {
  await invoke(fnArn, request, options);
} catch (e) {
  // your error handler here or if you like just ignore the try/catch
  // and let the error cascade down to a more general error handler
}
```

> Note: the AWS API exposes both an `invoke` and `invokeAsync` which is somewhat confusing
> because `invoke` can also be asynchronous! At this point no one should use the
> `invokeAsync` call as it is deprecated and therefore we ignore exposing this in our API.

## The `invoke` API

The **invoke** API only requires two parameters:

- the [ARN](https://docs.aws.amazon.com/AmazonS3/latest/dev/s3-arn-format.html)
  representing the function you are calling
- the parameters you want to send in (as an object)

See below for an example:

```typescript
await invoke("arn:aws:lambda:us-east-1:837955399040:function:myapp-prod-myfunction", {
  foo: 1,
  bar: 2
});
```

To make it more compact, you can set the following environment variables:

- First, you don't actually need the `arn:aws:lambda` at all, it will be assumed if you
  don't start with "arn".
- Second, if you set the `AWS_REGION` environment variable for your function then you can
  leave off that component.
- Third, if you provide `AWS_ACCOUNT` as a variable then you no longer need to state that
  in the string.
- Finally, if you provide `AWS_STAGE` then you can leave off the **prod** | **dev** |
  **_etc._** portion.

That means if you do all of the above you only need the following:

```typescript
await invoke("myfunction", { foo: 1, bar: 2 });
```

This also has the added benefit of dynamically adjusting to the stage you are in (which
you'll almost always want).

The last parameter in the signature is `options` (which is typed for those of you with
intellisense) but basically this gives you an option to:

- turn on the "dryrun" feature AWS exposes
- specify a specific version of the function (rather than the default)

Now if you weren't already sold on why you should be invoking using this more compact API than AWS's provide API, here's the clincher ... using `invoke` ensures that `x-correlation-id` and other contextual parameters are passed along to the next function so that logging in the _next_ function will have the same correlation id (which is actually the _intent_ of a correlation id).

> To see what parameters are being pass forward to the next function look at the `IAwsInvocationContext` interface defined in [types.ts](https://github.com/inocan-group/aws-log/blob/master/src/types.ts)

## The `stepFunction` API

[AWS Step Functions](https://aws.amazon.com/step-functions/) are quite useful tool in the
"serverless toolkit" but they also provide a manner in which many Lambda functions will be
executed together in concert. For this reason we must ensure that the Correlation ID is
maintained throughout this fan out. Fortunately this easily achieved with the
**stepFunction** API surface:

```typescript
// To start a step function
import { stepFunction } from "aws-log";

function anyFunction() {
  stepFunction.start(arn, props);
}
```

Then in any functions which are involved in the _steps_ of a step function be sure to
complete your handler with:

```typescript
import { logger, stepFunction } = "aws=log";

function handler(event, context, callback) {
  const log = logger().lambda(event, context);
  /** ... */
  callback(null, stepFunction.response( response ));
}
```

## Shipping

In Lambda you can specify a particular Lambda function to be executed with your serverless
functions to accept your STDOUT and STDERR streams. If you have an external logging
solution then you should attach a "shipping" function to ship these entries to that
external solution. Here at Inocan Group we use [Logzio](https://logzio.com) and if you do
as well you should feel free to use ours:
[`logzio-shipper`](https://github.com/inocan-group/logzio-shipper).

## License

Copyright (c) 2019 Inocan Group

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
