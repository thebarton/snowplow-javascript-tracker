<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/node-tracker](./node-tracker.md) &gt; [JsonProcessor](./node-tracker.jsonprocessor.md)

## JsonProcessor type

A function which will processor the Json onto the injected PayloadBuilder

<b>Signature:</b>

```typescript
type JsonProcessor = (payloadBuilder: PayloadBuilder, jsonForProcessing: EventJson, contextEntitiesForProcessing: SelfDescribingJson[]) => void;
```