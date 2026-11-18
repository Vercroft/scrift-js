# Add an endpoint or a resource

Only for a route the API already serves: never guess a response shape.

## An endpoint

1. Add its response types to `src/types.ts`, with the API's field names unchanged.
2. Add a method to its resource in `src/resources/`: one call to `this.http.requestJson`, `requestText` or
   `requestArrayBuffer` with the path, query and body. An argument check goes in a `types.ts` helper, as
   `assertValidBatchSlugs` does.
3. Test it in `tests/<resource>.test.ts`: the URL, method, body and return value, and one error status it can return.
4. Add its row to the method table in `README.md`.

## A resource

1. Create `src/resources/<name>.ts` with a class whose constructor takes the `HttpClient`.
2. Attach it in `src/client.ts`: `this.<name> = new <Name>Resource(http);`
3. Re-export the class from `src/index.ts`.
4. Add `tests/<name>.test.ts`.
