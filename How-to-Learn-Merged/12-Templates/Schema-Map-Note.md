---
aliases: [Schema Map Template, Isomorphism Note]
tags: [template, schema-map]
---

# 📋 Schema Map Note

> *Document a cross-domain isomorphism. The highest-leverage note type in the vault.*

---

## Template

```markdown
---
type: schema-map
date: <% tp.date.now("YYYY-MM-DD") %>
source-domain: <<domain A>>
target-domain: <<domain B>>
tags: [schema-map, <<topic>>]
---

# <<Source Schema>> ↔ <<Target Schema>>

## Source (the known)

<<Brief description of the source schema. 2-3 sentences.>>

## Target (the new)

<<Brief description of the target schema. 2-3 sentences.>>

## Alignment table

| Source (<<domain A>>) | Target (<<domain B>>) | Relation / notes |
|---|---|---|
| <<object/relation 1>> | <<object/relation 1'>> | <<correspondence>> |
| <<object/relation 2>> | <<object/relation 2'>> | <<correspondence>> |
| <<operation f>> | <<operation g>> | <<correspondence>> |
| ... | ... | ... |

## Transferred structure

<<What structure carries over from source to target?>>

- <<transfer 1>>
- <<transfer 2>>
- <<transfer 3>>

## Projected inferences (predictions)

<<What does the alignment predict about the target that you haven't verified?>>

- <<prediction 1>> → verified? Yes / No
- <<prediction 2>> → verified? Yes / No

## Disanalogies (where the isomorphism breaks)

<<Where does the source not map to the target?>>

- <<disanalogy 1>>
- <<disanalogy 2>>

## Applications

<<How can you use this isomorphism?>>

- <<application 1>>
- <<application 2>>

## Other related domains

<<Where else does this schema appear?>>

- <<domain 3>>
- <<domain 4>>

## Links

- [[<<related schema map 1>>]]
- [[<<related schema map 2>>]]
- [[<<concept note>>]]
```

---

## When to Use

When you notice a structural similarity between two domains you're learning. See [[Isomorphism-Detection]] for the protocol.

---

## Example Output

See [[Isomorphism-Detection]] for a worked example (state machine ↔ TCP connection).

---

## Cross-Links

- [[Isomorphism-Detection]] — the protocol
- [[Structure-Mapping-Theory]] — the underlying theory
- [[Concept-Note-Template]] — for the individual schemas being mapped

← Back to [[09-Templates/]]
