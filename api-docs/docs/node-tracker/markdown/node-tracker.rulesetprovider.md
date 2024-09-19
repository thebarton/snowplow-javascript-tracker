<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@snowplow/node-tracker](./node-tracker.md) &gt; [RuleSetProvider](./node-tracker.rulesetprovider.md)

## RuleSetProvider type

A ruleset provider is aa tuple that has two parts: a ruleset and the context primitive(s) If the ruleset allows the current event schema URI, the tracker will attach the context primitive(s)

<b>Signature:</b>

```typescript
type RuleSetProvider = [
    RuleSet,
    Array<ContextPrimitive> | ContextPrimitive
];
```