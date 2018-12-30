# Log Shipper

The log shipper is intended for serverless functions to use as their exclusive way
to write to STDOUT and STDERR. By using the `log.xxx()` methods you will ensure that
all output is in JSON format and that requests are tagged with a `x-correlation-id`.

The JSON format is important in any logging environment to provide a structured set
of information. While we have developed this with the [ELK stack](https://elastic.co)
in mind it should put data into a format that's useful for any reporting environment.

So why STDOUT and STDERR? Well we use these standard pipes because AWS Lambda allows
us to do this at "no cost" to execution of our serverless functions. It also means
that this data is available in **Cloudwatch** logs and gives you the ability -- where
it makes sense -- to configure alerts there too.

For a micro-service architecture, however, it is **often** the case that logging is
best externalized to a separate environment. This module does not support that directly
but it is a relatively simple process of creating a "shipper function" which will be
called at each Lambda execution and be streamed the STDOUT/STDERR so you can forward
that onto the appropriate logging service.

Because as a company we use [Logzio](https://logzio.com) for our shipping we have created
a shipper for this purpose. If you care to use that you can find it on **NPM** as
`log-shipper-logzio`;
