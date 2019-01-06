# AWS log

The **aws-log** module is intended for serverless functions to use as their exclusive way to
write to STDOUT and STDERR. By using using this library you will:

- be assured that all data sent to your logging solution will be as structured JSON string
- contextual information will be sent along with the details of that log message
- automatic creation of a correlation-id for cross-function tracing
- your "shipper" function will be able to filter log messages based on configured "severity"

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
import logger from "aws-log";
const { log, debug, info, warn, error } = logger();

log("this is a log message", { foo: 1, bar: 2 });
```

In this simple example this will produce the following output to STDOUT:

```json
{
  "message": "this is a log message",
  "foo": 1,
  "bar": 2,
  "@x-correlation-id": "1234-xyzd-abcd",
  "@severity": 1
}
```

Things to know about using the `log`, `info`, `debug`, `warn` or `error` functions; all of
which hang off the return from the `logger()` function you see in the example above:

- we ALWAYS get a JSON object as a return (good for logging frameworks)
- The first calling parameter is mapped to the `message` parameter in the output
- The second calling parameter is _optional_ but allows you to add other structured
  attributes which help to define the log message
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

  &nbsp;

  > Note: **log** is just an _alias_ for the **info** level; we find "log" to be a little
  > easier to use but traditional logging systems use "info" more consistenly.

## Persistent Context

While each log message has unique data which you want to log, there is also "context" that
when placed next to the specific message can make the data much more searchable and
thereby more useful. There are a few ways to achieve this context but here's the most
basic:

```typescript
const { log, debug, info, warn, error } = logger().context({ foo: "bar" });
log("this is a log message", { foo: 1, bar: 2 });
```

In this example the output would be:

```json
{
  "message": "this is a log message",
  "foo": 1,
  "bar": 2,
  "@x-correlation-id": "1234-xyzd-abcd",
  "@severity": 1,
  "context": {
    "foo": "bar"
  }
}
```

Every call to `debug`, `info` / `log`, `warn` and `error` will now always include the
properties you have passed in as **context**.

> Note: If your specific log content includes a property `context` then the logger will
> rename it to `_context_`. It is important for function-to-function consistency that the
> meaning of "context" remain consistent.

## Logging Context in AWS Lambda

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

The main difference in these two situations is in the data passed in as the **event**. In the case of an API-Gateway call, the event has lots of meta-data travelling with it. For a complete list refer to
[Lambda Proxy Request](https://github.com/lifegadget/common-types/blob/master/src/aws.ts#L76-L131). The quick summary is that it passes the client's "query parameters", "path parameters" and "body" of the message. This makes up the distinct "request" that will be considered in your functions but it also passes a bunch of variant data about the client such as "what browser?", "which geography?", etc. For a normal lambda-to-lambda function call the "event" is exactly what the calling function passed in.

The `context` object is largely the same between the two types of Lambda's mentioned above but in both cases provides some useful meta-data for logging. For those interested the full typeing is here: [IAWSLambaContext](https://github.com/lifegadget/common-types/blob/master/src/aws.ts#L133-L170).

All this information, regardless of which type of function it is, becomes "background knowledge" as `aws-log` will take care of all the contextual information for you if you use `.lambda(event, context)`, providing you with the following attributes on your context property:

```typescript
/** the REST command (e.g., GET, PUT, POST, DELETE) */
httpMethod: string;
/** the path to the endpoint called */
path: string;
/** parameters passed to function as a query parameter; aka, the name-value pairs after the "&" character */
queryStringParameters: string;
/** parameters passed in via the path itself
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
```

## Files External to Handler

We've already discussed the utility of passing the `event` and `context` attributes to the logger and in the handler function we have a simple way of achieving this as these two objects are immediately available:

```typescript
export function handler(event, context) {
   const { log, debug, info, warn, error } = logger().lambda(event, context);
   // ...
}
```

But unless we keep passing around the `event` and `context` how would we maintain context in logging that's in a utility function, etc.? The answer is after the context has been set with `logger().lambda(event, context)` you can simply write:

```typescript
const { log, debug, info, warn, error } = logger().reloadContext();
function doSomething() {
  log("something has happened");
}
```

## More Context

The original, and generic, `logger.context(obj)` method allowed us to add whatever name/value pairs we pleased but with `logger.lambda(event, context)` we rely on **aws-log** to choose context for us. This is probably good enough for most situations but wherever you want to add more you can do so easily enough:

```typescript
// in the handler function
const { log, debug, info, warn, error } = logger().lambda(event, context, moreContext);
// somewhere else
const { log, debug, info, warn, error } = logger().reloadContext(moreContext);
```

> **NOTE:** that while both signatures are valid, the first one is STRONGLY recommended because "context" is meant to be information which is valid for the full execution of the function. Typically we'd expect this to be established as the first line of the handler function not later in the execution.

## Correlation ID

The correlation ID -- which shows up as `@x-correlation-id` in the log entry -- is an ID who's scope is meant to stay consistent for a whole _graph_ of function executions. This scoping is SUPER useful as within AWS most logging is isolated to a single function execution but in a micro-services architecture this often represents too narrow a view.

The way the correlation ID is set is when "context" is provided -- typically via the `lambda(event, context)` parameters -- it looks  for a property `x-correlation-id` in the "headers" property of the event. This means that if you are originating a request via API-Gateway, you _can_ pass in this value as part of the request. In fact, it is _often_ the case that graph of function executions does originate from API-Gateway but even in this situation we typically suggest the client does not send in a correlation ID unless there is a chain of logging that preceeded this call on the client side. In most cases, the absence of a correlation ID results in one being created automatically. Once it is created though it must be _forwarded_ to all other executions downstream. This is achieved via a helper method provided by this library called `invoke`.

### Passing the Correlation ID with `invoke`

The standard way of calling a Lambda functon from within a Lambda is through the [invoke](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property) method of the AWS Lambda interface:

```typescript
import { Lambda } from "aws-sdk";
const lambda = new Lambda({ region: "us-east-1" });
lambda.invoke(params, fn(err, data) { ... });
```

As a convenience, this library provides `invoke` which provides the same functionality but with a simplified calling structure:

```typescript
import { invoke } from "aws-log";
try {
   await invoke(fnArn, request, options);
} catch(e) {
  // your error handler here or if you like just ignore the try/catch
  // and let the error cascade down to a more general error handler
}
```

> Note: the AWS API exposes both an `invoke` and `invokeAsync`  which is a little confusing sometimes because `invoke` can also be asynchronous! At this point no one should use the `invokeAsync` call as it is deprecated and therefore we ignore exposing this in our API.

### The Request API for `invoke`

The request API only requires two parameters:

- the [ARN](https://docs.aws.amazon.com/AmazonS3/latest/dev/s3-arn-format.html) representing the function you are calling
- the parameters you want to send in (as an object)

See below for an example:

```typescript
await invoke(
  "arn:aws:lambda:us-east-1:837955399040:function:myapp-prod-myfunction",
  { foo: 1, bar: 2 }
);
```

Now that's sort of compact but you can make it **much** more compact if you follow a few conventions:

- First, you don't actually need the `arn:aws:lambda` at all, it will be assumed if you don't start with "arn".
- Second, if you set the `AWS_REGION` environment variable for your function then you can leave off that component.
- Third, if you provide `AWS_ACCOUNT` as a variable then you no longer need to state that in the string.
- Finally, if you provide `AWS_STAGE` then you can leave off the **prod** | **dev** | **_etc._** portion.

That means if you do all of the above you only need the following:

```typescript
await invoke("myfunction", { foo: 1, bar: 2 });
```

This also has the added benefit of dynamically adjusting to the stage you are in (which you'll almost always want).

The last parameter in the signature is `options` (which is typed for those of you with intellisense) but basically this gives you an option to:

- turn on the "dryrun" feature AWS exposes
- specify a specific version of the function (rather than the default)

## Shipping

In Lambda you can specify a particular Lambda function to be executed with your serverless functions to accept your STDOUT and STDERR streams. If you have an external logging solution then you should attach a "shipping" function to ship these entries to that external solution. Here at Inocan Group we use [Logzio](https://logzio.com) and if you do as well you should feel free to use ours: [`logzio-shipper`](https://github.com/inocan-group/logzio-shipper).

## License

Copyright (c) 2019 Inocan Group

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
