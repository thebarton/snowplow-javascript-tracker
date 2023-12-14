<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/browser-tracker](./browser-tracker.md) &gt; [trackStructEvent](./browser-tracker.trackstructevent.md)

## trackStructEvent() function

Track a structured event A classic style of event tracking, allows for easier movement between analytics systems. A loosely typed event, creating a Self Describing event is preferred, but useful for interoperability.

<b>Signature:</b>

```typescript
declare function trackStructEvent(event: StructuredEvent & CommonEventProperties, trackers?: Array<string>): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  event | StructuredEvent &amp; CommonEventProperties | The Structured Event properties |
|  trackers | Array&lt;string&gt; | The tracker identifiers which the event will be sent to |

<b>Returns:</b>

void
