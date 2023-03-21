# Capturing Only Unhandled Exceptions with Sentry in Python

Sentry is a popular error tracking and monitoring tool that helps developers identify and fix issues in their applications. By default, Sentry captures unhandled exceptions and logged errors. However, in some cases, you might want to focus on unhandled exceptions only, or you might encounter a situation where Sentry reports handled exceptions without your consent from other integrations. In this blog post, we will show you how to configure Sentry to capture unhandled exceptions only in your Python applications.

> Note: Handled exceptions can be useful in some situations, especially when you want to capture them manually. If you prefer to keep capturing handled exceptions, you can modify the function presented in this post to only ignore logger events.

## Configuring Sentry to Capture Unhandled Exceptions Only

To achieve this, you can utilize Sentry's `before_send` callback. This callback allows you to modify and filter events before they are sent to Sentry. Here is the code that demonstrates how to configure Sentry to capture unhandled exceptions only:

```python
sentry_sdk.init(
    dsn=dsn,
    environment=environment,
    before_send=sentry_before_send,
)

def sentry_before_send(event, hint):
    """Filters Sentry events before sending.

    This function filters out handled exceptions and logged errors.
    By doing this we will only receive unhandled exceptions on Sentry.

    Args:
        event (dict): The event dictionary containing exception data.

        hint (dict): Additional information about the event, including
            the original exception.

    Returns:
        dict: The modified event dictionary, or None if the event should be
            ignored.
    """

    # Ignore logged errors
    if "logger" in event:
        return None

    # Ignore handled exceptions
    exceptions = event.get("exception", {}).get("values", [])
    if exceptions:
        exc = exceptions[-1]
        mechanism = exc.get("mechanism")

        if mechanism:
            if mechanism.get("handled"):
                return None

    return event
```

With this configuration, Sentry will ignore both handled exceptions and logged errors, focusing only on unhandled exceptions. This helps to reduce noise in your Sentry dashboard and allows you to concentrate on the most critical issues in your application.

We hope this post is helpful to those who want to customize Sentry's exception reporting behavior. Happy debugging!
