/**
 * Curated question bank used by `npm run seed:questions`.
 *
 * `mcq(question, options, correctIndex, ...)` marks one option correct; text
 * questions carry `expectedKeywords` which the ML evaluator scores against.
 */

const mcq = (question, options, correctIndex, explanation, topics) => ({
  type: 'MCQ',
  question,
  options: options.map((option, index) => ({ option, isCorrect: index === correctIndex })),
  correctAnswer: options[correctIndex],
  explanation,
  topics,
  expectedKeywords: topics
});

const text = (question, expectedKeywords, explanation, topics) => ({
  type: 'Text',
  question,
  expectedKeywords,
  explanation,
  topics
});

const bank = {
  'Frontend Developer': {
    Beginner: [
      mcq(
        'Which value of the CSS `position` property removes an element from the normal document flow and positions it relative to the viewport?',
        ['relative', 'absolute', 'fixed', 'sticky'],
        2,
        '`fixed` positions the element relative to the viewport, so it stays put while the page scrolls.',
        ['css', 'positioning', 'layout']
      ),
      mcq(
        'What does `useState` return in a React function component?',
        ['The current state only', 'A setter function only', 'An array of the current state and a setter', 'A promise resolving to the state'],
        2,
        '`const [value, setValue] = useState(initial)` destructures the state value and its setter.',
        ['react', 'hooks', 'state']
      ),
      text(
        'Explain the difference between `let`, `const` and `var` in JavaScript.',
        ['scope', 'block', 'hoisting', 'reassignment', 'temporal dead zone'],
        '`let`/`const` are block scoped and live in the temporal dead zone until initialised; `var` is function scoped and hoisted as `undefined`. `const` bindings cannot be reassigned.',
        ['javascript', 'scope', 'hoisting']
      ),
      text(
        'What is the difference between the DOM and the virtual DOM?',
        ['dom', 'virtual dom', 'diffing', 'reconciliation', 'performance'],
        'React keeps a lightweight in-memory tree, diffs it after each render and applies the minimal set of real DOM mutations.',
        ['react', 'dom', 'rendering']
      )
    ],
    Intermediate: [
      mcq(
        'Which React hook prevents an expensive calculation from re-running on every render?',
        ['useEffect', 'useMemo', 'useRef', 'useLayoutEffect'],
        1,
        '`useMemo` caches the computed value and recomputes only when its dependencies change.',
        ['react', 'hooks', 'memoization']
      ),
      text(
        'How does the JavaScript event loop handle promises versus `setTimeout`?',
        ['event loop', 'microtask', 'macrotask', 'call stack', 'queue'],
        'Promise callbacks go on the microtask queue and are drained after the current task, before timer (macrotask) callbacks.',
        ['javascript', 'event loop', 'async']
      ),
      text(
        'How would you debug and fix a slow-rendering React list of 10,000 rows?',
        ['virtualization', 'memo', 'key', 'profiler', 'pagination'],
        'Profile first, then window/virtualise the list, memoise row components, use stable keys and avoid recreating callbacks each render.',
        ['react', 'performance', 'profiling']
      ),
      text(
        'What is a CSS stacking context and when does one get created?',
        ['stacking context', 'z-index', 'transform', 'opacity', 'position'],
        'A stacking context is created by the root element and by elements with e.g. non-auto `z-index` plus positioning, `transform`, `opacity < 1` or `will-change`; `z-index` only compares siblings inside the same context.',
        ['css', 'z-index', 'layout']
      )
    ],
    Advanced: [
      mcq(
        'Which metric measures the largest visible content element rendering time in Core Web Vitals?',
        ['FID', 'CLS', 'LCP', 'TTFB'],
        2,
        'Largest Contentful Paint (LCP) reports when the biggest above-the-fold element finished rendering.',
        ['performance', 'web vitals', 'metrics']
      ),
      text(
        'Explain how you would implement code splitting and route-level lazy loading, and how you would measure the benefit.',
        ['code splitting', 'lazy', 'suspense', 'bundle', 'lighthouse'],
        'Split at route boundaries with dynamic `import()` + `React.lazy`/`Suspense`, verify chunk sizes with a bundle analyser and confirm LCP/TTI improvements in Lighthouse.',
        ['performance', 'bundling', 'react']
      ),
      text(
        'How do you make a custom dropdown component accessible?',
        ['aria', 'keyboard', 'focus', 'role', 'screen reader'],
        'Use correct roles (`combobox`/`listbox`/`option`), manage focus and `aria-activedescendant`, support arrow/Escape/Enter keys and announce state changes to screen readers.',
        ['accessibility', 'aria', 'components']
      ),
      text(
        'How would you design client-side state for an app with server data, optimistic updates and offline support?',
        ['cache', 'optimistic', 'invalidation', 'normalization', 'offline'],
        'Separate server cache (query library with invalidation) from local UI state, normalise entities, apply optimistic updates with rollback and queue mutations while offline.',
        ['architecture', 'state management', 'caching']
      )
    ]
  },

  'Backend Developer': {
    Beginner: [
      mcq(
        'Which HTTP status code should a successful `POST` that created a resource return?',
        ['200', '201', '202', '204'],
        1,
        '201 Created signals a new resource was created, usually with a `Location` header.',
        ['http', 'rest', 'status codes']
      ),
      mcq(
        'In Express, what is the correct signature of an error-handling middleware?',
        ['(req, res)', '(req, res, next)', '(err, req, res, next)', '(err, next)'],
        2,
        'Express identifies error handlers by their four-argument signature.',
        ['express', 'middleware', 'node']
      ),
      text(
        'Explain the core principles of a REST API.',
        ['stateless', 'resource', 'http methods', 'uniform interface', 'representation'],
        'REST exposes resources through a uniform interface, uses standard HTTP methods and status codes and keeps requests stateless.',
        ['rest', 'api design', 'http']
      ),
      text(
        'What is the difference between authentication and authorization?',
        ['authentication', 'authorization', 'identity', 'permission', 'token'],
        'Authentication proves who the caller is (e.g. verifying a JWT); authorization decides what that identity may do (roles, permissions).',
        ['security', 'auth', 'jwt']
      )
    ],
    Intermediate: [
      mcq(
        'Which MongoDB index best serves a query filtering on `user` and sorting by `createdAt` descending?',
        ['Single index on user', 'Single index on createdAt', 'Compound index on {user: 1, createdAt: -1}', 'Text index on user'],
        2,
        'A compound index matching the equality field first and then the sort field lets Mongo satisfy both without an in-memory sort.',
        ['mongodb', 'indexing', 'query performance']
      ),
      text(
        'How would you implement refresh tokens on top of JWT access tokens?',
        ['refresh token', 'expiry', 'rotation', 'httponly', 'revocation'],
        'Issue a short-lived access token plus a long-lived refresh token stored in an HttpOnly cookie, rotate it on use and keep a revocation list so stolen tokens can be invalidated.',
        ['security', 'jwt', 'sessions']
      ),
      text(
        'Explain how you would handle a slow third-party API call inside a request handler.',
        ['timeout', 'retry', 'circuit breaker', 'queue', 'cache'],
        'Set aggressive timeouts, retry with backoff on idempotent calls, break the circuit on repeated failures and move non-critical work to a background queue or serve cached data.',
        ['resilience', 'integration', 'performance']
      ),
      text(
        'What causes the N+1 query problem and how do you fix it?',
        ['n+1', 'join', 'populate', 'batch', 'eager loading'],
        'It happens when a list query is followed by one query per item; fix it by joining/populating, batching ids with a single `$in` query or a dataloader.',
        ['databases', 'performance', 'orm']
      )
    ],
    Advanced: [
      mcq(
        'Which technique gives at-most-once side effects for a payment endpoint retried by clients?',
        ['Rate limiting', 'Idempotency keys', 'Optimistic locking', 'Read replicas'],
        1,
        'The server stores the result per idempotency key and replays it instead of charging again.',
        ['idempotency', 'api design', 'payments']
      ),
      text(
        'Design the write path for an API that must sustain 10k requests per second.',
        ['horizontal scaling', 'queue', 'sharding', 'cache', 'backpressure'],
        'Scale stateless app nodes behind a load balancer, buffer writes in a queue, shard/partition the datastore, cache hot reads and apply backpressure and rate limits.',
        ['scalability', 'architecture', 'system design']
      ),
      text(
        'How do you keep a database and a downstream service consistent without distributed transactions?',
        ['outbox', 'saga', 'eventual consistency', 'idempotent', 'retry'],
        'Use the transactional outbox pattern or sagas with compensating actions: commit intent locally, publish events asynchronously and make consumers idempotent.',
        ['distributed systems', 'consistency', 'messaging']
      ),
      text(
        'What do you instrument to debug a latency regression in production?',
        ['tracing', 'metrics', 'percentile', 'logs', 'slo'],
        'Distributed traces to find the slow span, p95/p99 latency metrics per endpoint and dependency, structured logs correlated by request id, compared against SLOs.',
        ['observability', 'performance', 'monitoring']
      )
    ]
  },

  'Full Stack Developer': {
    Beginner: [
      mcq(
        'What does CORS control?',
        ['Database access rights', 'Which origins a browser may read responses from', 'TLS certificate validation', 'Server-side rate limits'],
        1,
        'CORS headers tell the browser which cross-origin responses JavaScript is allowed to read.',
        ['cors', 'browser', 'security']
      ),
      text(
        'Walk through what happens from typing a URL to seeing a rendered page.',
        ['dns', 'tcp', 'tls', 'http', 'render'],
        'DNS resolution, TCP/TLS handshake, HTTP request, server response, HTML parsing, subresource fetches, then layout and paint.',
        ['web fundamentals', 'networking', 'browser']
      ),
      text(
        'Where should a JWT be stored in a browser app and why?',
        ['httponly cookie', 'localstorage', 'xss', 'csrf', 'expiry'],
        'An HttpOnly, Secure, SameSite cookie resists XSS exfiltration but needs CSRF protection; localStorage is readable by any injected script.',
        ['security', 'auth', 'frontend']
      ),
      text(
        'What is an environment variable and why should secrets never be committed?',
        ['environment variable', 'secret', 'config', 'rotation', 'git history'],
        'Env vars keep per-deployment config out of code; committed secrets stay in git history forever and must be rotated once leaked.',
        ['configuration', 'security', 'deployment']
      )
    ],
    Intermediate: [
      mcq(
        'Where do `REACT_APP_*` variables get injected in a create-react-app project?',
        ['At runtime in the browser', 'At build time into the bundle', 'By the server on each request', 'From a .env fetched at startup'],
        1,
        'CRA inlines them during `npm run build`, so changing one requires rebuilding — and they are public.',
        ['react', 'build', 'configuration']
      ),
      text(
        'How do you version an API without breaking existing clients?',
        ['versioning', 'backward compatible', 'deprecation', 'additive', 'contract'],
        'Make additive changes, version in the path or a header, keep old fields until clients migrate and publish a deprecation timeline.',
        ['api design', 'compatibility', 'process']
      ),
      text(
        'Describe your approach to pagination for a feed endpoint.',
        ['cursor', 'offset', 'limit', 'index', 'stable sort'],
        'Cursor/keyset pagination on an indexed, stable sort key avoids the drift and cost of large `skip` offsets.',
        ['api design', 'databases', 'performance']
      ),
      text(
        'How would you add file uploads to a MERN app safely?',
        ['multipart', 'size limit', 'mime', 'signed url', 'virus scan'],
        'Validate size and content type, prefer direct-to-storage signed URLs, store outside the web root and never trust the client-provided filename.',
        ['uploads', 'security', 'architecture']
      )
    ],
    Advanced: [
      mcq(
        'Which deployment strategy lets you shift a small percentage of traffic to a new version first?',
        ['Blue-green', 'Canary', 'Recreate', 'Rolling back'],
        1,
        'Canary releases route a slice of traffic to the new version while metrics are watched.',
        ['deployment', 'release', 'devops']
      ),
      text(
        'Design a zero-downtime schema migration for a live MongoDB collection.',
        ['backfill', 'dual write', 'feature flag', 'rollback', 'expand contract'],
        'Expand (add the new field, dual-write), backfill in batches, switch reads behind a flag, then contract by removing the old field once safe.',
        ['migrations', 'databases', 'operations']
      ),
      text(
        'How do you decide between server-side rendering, static generation and client rendering?',
        ['seo', 'ttfb', 'caching', 'personalization', 'freshness'],
        'Static for cacheable public content, SSR when SEO and per-request personalisation matter, client rendering for authenticated dashboards behind a login.',
        ['architecture', 'rendering', 'performance']
      ),
      text(
        'What does your CI/CD pipeline run before a production deploy, and why?',
        ['lint', 'test', 'build', 'migration', 'rollback'],
        'Lint and unit/integration tests, a production build, dependency/security audit, gated migrations and an automated rollback path with health checks.',
        ['ci', 'deployment', 'quality']
      )
    ]
  },

  'Java Developer': {
    Beginner: [
      mcq(
        'Which statement about `String` in Java is true?',
        ['It is mutable', 'It is immutable and interned in a pool', 'It is a primitive type', 'It cannot be used as a map key'],
        1,
        'Strings are immutable; literals are interned in the string pool, which makes them safe hash keys.',
        ['java', 'strings', 'immutability']
      ),
      mcq(
        'What is the difference between `==` and `.equals()` for objects?',
        ['No difference', '`==` compares references, `.equals()` compares value semantics', '`==` compares values, `.equals()` compares references', '`.equals()` only works on primitives'],
        1,
        '`==` tests reference identity; `.equals()` tests logical equality as implemented by the class.',
        ['java', 'equality', 'objects']
      ),
      text(
        'Explain the difference between an interface and an abstract class.',
        ['interface', 'abstract', 'multiple inheritance', 'default method', 'state'],
        'An abstract class can hold state and constructors and is singly inherited; interfaces declare contracts (with default methods) and a class may implement many.',
        ['java', 'oop', 'design']
      ),
      text(
        'What does the JVM garbage collector do?',
        ['heap', 'garbage collection', 'generational', 'reachability', 'pause'],
        'It reclaims unreachable objects from the heap, typically generationally (young/old), trading throughput against pause time.',
        ['java', 'jvm', 'memory']
      )
    ],
    Intermediate: [
      mcq(
        'In Spring, what does `@Transactional` on a public service method do by default?',
        ['Nothing without XML config', 'Starts a transaction and rolls back on unchecked exceptions', 'Rolls back on all exceptions including checked ones', 'Commits after every statement'],
        1,
        'The default proxy rolls back on `RuntimeException`/`Error` only; checked exceptions commit unless `rollbackFor` is set.',
        ['spring', 'transactions', 'jpa']
      ),
      text(
        'How does `HashMap` work internally and what changed in Java 8?',
        ['hash', 'bucket', 'collision', 'linked list', 'red-black tree'],
        'Keys hash into buckets; collisions form a linked list that converts to a red-black tree past a threshold (Java 8), improving worst-case lookup to O(log n).',
        ['java', 'collections', 'data structures']
      ),
      text(
        'Explain the difference between `synchronized`, `volatile` and `AtomicInteger`.',
        ['mutual exclusion', 'visibility', 'happens-before', 'cas', 'atomicity'],
        '`synchronized` gives mutual exclusion and visibility; `volatile` gives visibility/ordering only; atomics give lock-free atomic updates via compare-and-swap.',
        ['java', 'concurrency', 'memory model']
      ),
      text(
        'What is the N+1 select problem in Hibernate and how do you avoid it?',
        ['lazy loading', 'join fetch', 'entity graph', 'batch size', 'n+1'],
        'Lazy associations trigger one query per parent; fix with `JOIN FETCH`, entity graphs or `@BatchSize`.',
        ['hibernate', 'jpa', 'performance']
      )
    ],
    Advanced: [
      mcq(
        'Which garbage collector targets predictable low pause times on large heaps?',
        ['SerialGC', 'ParallelGC', 'G1GC', 'No GC'],
        2,
        'G1 (and ZGC/Shenandoah) aim for bounded pause times via region-based, mostly concurrent collection.',
        ['jvm', 'gc', 'tuning']
      ),
      text(
        'How would you diagnose a memory leak in a long-running Spring Boot service?',
        ['heap dump', 'profiler', 'retained size', 'gc log', 'classloader'],
        'Watch GC logs and old-gen growth, capture a heap dump at high usage and analyse dominators/retained sizes for unintended references such as caches or classloader leaks.',
        ['jvm', 'debugging', 'operations']
      ),
      text(
        'Compare thread-per-request with reactive/non-blocking IO for a high-concurrency service.',
        ['thread pool', 'non-blocking', 'backpressure', 'reactive', 'latency'],
        'Thread-per-request is simpler but memory-bound at high concurrency; reactive stacks multiplex on few threads with backpressure at the cost of harder debugging.',
        ['concurrency', 'architecture', 'spring']
      ),
      text(
        'How do you design a microservice boundary and its data ownership?',
        ['bounded context', 'ownership', 'api contract', 'coupling', 'events'],
        'Align services with bounded contexts, give each exclusive ownership of its data, integrate through explicit contracts/events and avoid shared databases.',
        ['microservices', 'design', 'architecture']
      )
    ]
  },

  'Cyber Security Analyst': {
    Beginner: [
      mcq(
        'Which OWASP category covers SQL and command injection?',
        ['Broken Access Control', 'Injection', 'Security Misconfiguration', 'Cryptographic Failures'],
        1,
        'Injection flaws occur when untrusted input is interpreted as code or query syntax.',
        ['owasp', 'injection', 'appsec']
      ),
      mcq(
        'What does hashing a password with a per-user salt prevent?',
        ['Brute force entirely', 'Rainbow table reuse across accounts', 'Network sniffing', 'Session hijacking'],
        1,
        'Salts make precomputed hash tables useless and stop identical passwords from sharing a hash.',
        ['cryptography', 'passwords', 'hashing']
      ),
      text(
        'Explain the difference between symmetric and asymmetric encryption.',
        ['symmetric', 'asymmetric', 'public key', 'private key', 'key exchange'],
        'Symmetric uses one shared secret and is fast; asymmetric uses a keypair and is used for key exchange and signatures.',
        ['cryptography', 'encryption', 'fundamentals']
      ),
      text(
        'What is the principle of least privilege?',
        ['least privilege', 'permission', 'role', 'blast radius', 'access control'],
        'Every identity gets only the permissions it needs, limiting the blast radius of a compromise.',
        ['access control', 'security principles', 'iam']
      )
    ],
    Intermediate: [
      mcq(
        'Which control most directly mitigates stored XSS?',
        ['Rate limiting', 'Context-aware output encoding', 'HTTPS', 'Password rotation'],
        1,
        'Encoding untrusted data for the output context (HTML, attribute, JS) prevents it executing as script; CSP adds defence in depth.',
        ['xss', 'appsec', 'owasp']
      ),
      text(
        'Walk through your incident response process for a suspected data breach.',
        ['detect', 'contain', 'eradicate', 'recover', 'lessons learned'],
        'Detect and triage, contain affected systems, preserve evidence, eradicate the root cause, recover services and run a blameless post-incident review with notification duties.',
        ['incident response', 'process', 'forensics']
      ),
      text(
        'How do you triage a flood of SIEM alerts?',
        ['siem', 'triage', 'correlation', 'false positive', 'severity'],
        'Prioritise by asset criticality and severity, correlate related events into one incident, tune rules to cut false positives and document repeatable playbooks.',
        ['siem', 'monitoring', 'operations']
      ),
      text(
        'What is CSRF and how do you defend against it?',
        ['csrf', 'token', 'samesite', 'origin', 'state changing'],
        'A cross-site request abuses ambient cookies; defend with SameSite cookies, per-session CSRF tokens and origin/referer checks on state-changing requests.',
        ['csrf', 'appsec', 'web security']
      )
    ],
    Advanced: [
      mcq(
        'What is the main goal of network segmentation in a zero-trust design?',
        ['Faster throughput', 'Limiting lateral movement', 'Cheaper hardware', 'Simpler DNS'],
        1,
        'Segmentation plus per-request authorisation stops an attacker pivoting freely after initial access.',
        ['zero trust', 'network', 'architecture']
      ),
      text(
        'How would you threat model a new customer-facing API?',
        ['threat model', 'attack surface', 'stride', 'trust boundary', 'mitigation'],
        'Diagram data flows and trust boundaries, enumerate threats (e.g. STRIDE), rate risk, then assign concrete mitigations and tests per threat.',
        ['threat modeling', 'design', 'appsec']
      ),
      text(
        'How do you secure secrets and credentials across CI/CD and production?',
        ['secret manager', 'rotation', 'least privilege', 'audit', 'short lived'],
        'Store secrets in a managed vault, inject at runtime, prefer short-lived/workload identities, rotate automatically and audit every access.',
        ['secrets', 'devsecops', 'iam']
      ),
      text(
        'Explain how you would detect and respond to credential stuffing against a login endpoint.',
        ['rate limit', 'anomaly', 'mfa', 'breached password', 'lockout'],
        'Look for distributed low-rate attempts with high failure ratios, throttle per IP/account, require MFA or step-up challenges and block known-breached passwords.',
        ['detection', 'auth', 'abuse']
      )
    ]
  },

  'Data Analyst': {
    Beginner: [
      mcq(
        'Which SQL clause filters rows after `GROUP BY` aggregation?',
        ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
        1,
        '`WHERE` filters rows before grouping; `HAVING` filters the aggregated groups.',
        ['sql', 'aggregation', 'querying']
      ),
      mcq(
        'Which measure of central tendency is most robust to outliers?',
        ['Mean', 'Median', 'Sum', 'Range'],
        1,
        'The median depends on rank, not magnitude, so extreme values barely move it.',
        ['statistics', 'descriptive stats', 'outliers']
      ),
      text(
        'Explain the difference between an INNER JOIN and a LEFT JOIN.',
        ['inner join', 'left join', 'null', 'matching rows', 'preserve'],
        'INNER keeps only matching rows; LEFT keeps every left row and fills unmatched right columns with NULL.',
        ['sql', 'joins', 'fundamentals']
      ),
      text(
        'How would you handle missing values in a dataset?',
        ['missing', 'imputation', 'drop', 'bias', 'flag'],
        'Understand why data is missing, then drop, impute (mean/median/model) or add a missingness flag — and document the bias each choice introduces.',
        ['data cleaning', 'pandas', 'statistics']
      )
    ],
    Intermediate: [
      mcq(
        'Which window function assigns a distinct sequential rank without gaps?',
        ['RANK()', 'DENSE_RANK()', 'ROW_NUMBER()', 'NTILE()'],
        2,
        '`ROW_NUMBER()` always increments by one; `RANK()` leaves gaps after ties and `DENSE_RANK()` does not.',
        ['sql', 'window functions', 'analytics']
      ),
      text(
        'A dashboard metric dropped 30% overnight. How do you investigate?',
        ['data pipeline', 'segment', 'seasonality', 'instrumentation', 'root cause'],
        'First rule out pipeline/instrumentation breakage, then segment by dimension, compare against seasonality and correlate with releases before concluding it is real.',
        ['analysis', 'debugging', 'metrics']
      ),
      text(
        'Explain p-values and statistical significance in an A/B test.',
        ['p-value', 'null hypothesis', 'significance', 'sample size', 'power'],
        'The p-value is the probability of seeing an effect this extreme under the null hypothesis; significance needs a pre-registered threshold, adequate sample size and power.',
        ['statistics', 'experimentation', 'ab testing']
      ),
      text(
        'How do you design an ETL job that must be safe to re-run?',
        ['idempotent', 'incremental', 'watermark', 'validation', 'partition'],
        'Make loads idempotent (upsert by key or replace a partition), track a watermark for incremental pulls and validate row counts before publishing.',
        ['etl', 'pipelines', 'data engineering']
      )
    ],
    Advanced: [
      mcq(
        'What does a high R² but poor test-set performance most likely indicate?',
        ['Underfitting', 'Overfitting', 'Data leakage is impossible', 'Perfect model'],
        1,
        'Fitting training noise (or leaking features) produces strong in-sample fit and weak generalisation.',
        ['modeling', 'overfitting', 'validation']
      ),
      text(
        'How do you detect and prevent data leakage in a predictive model?',
        ['leakage', 'target', 'time split', 'feature', 'validation'],
        'Audit features for post-outcome information, use time-based splits, fit transformations inside cross-validation folds and be suspicious of implausibly good scores.',
        ['machine learning', 'validation', 'modeling']
      ),
      text(
        'Explain how you would measure the incremental impact of a campaign without a clean randomised test.',
        ['causal', 'control group', 'difference in differences', 'confounder', 'holdout'],
        'Use quasi-experimental designs — difference-in-differences, synthetic control or matched cohorts — and test robustness against confounders.',
        ['causal inference', 'analysis', 'experimentation']
      ),
      text(
        'How would you model and query 500M events for ad-hoc analysis?',
        ['partition', 'columnar', 'aggregate table', 'clustering', 'cost'],
        'Store columnar and partition/cluster on the common filter keys, pre-aggregate frequent rollups and limit scanned bytes to control cost and latency.',
        ['data warehouse', 'performance', 'modeling']
      )
    ]
  },

  'HR Interview': {
    Beginner: [
      mcq(
        'Which structure best answers a behavioural question?',
        ['Random anecdotes', 'STAR: Situation, Task, Action, Result', 'Only the result', 'Only your job title'],
        1,
        'STAR keeps the answer concrete and shows your specific contribution plus the measurable outcome.',
        ['behavioral', 'communication', 'star']
      ),
      text(
        'Tell me about yourself.',
        ['background', 'experience', 'strength', 'goal', 'role'],
        'A 90-second narrative: relevant background, a highlight or two with impact, and why this role is the logical next step.',
        ['introduction', 'communication', 'motivation']
      ),
      text(
        'Why do you want to work here?',
        ['product', 'mission', 'team', 'growth', 'contribution'],
        'Connect specifics about the company/product to what you want to build and the skills you would bring.',
        ['motivation', 'company research', 'fit']
      ),
      text(
        'What are your greatest strengths and weaknesses?',
        ['strength', 'weakness', 'example', 'improvement', 'self awareness'],
        'Give an evidenced strength and a genuine weakness plus the concrete steps you are taking to improve it.',
        ['self awareness', 'communication', 'growth']
      )
    ],
    Intermediate: [
      text(
        'Describe a conflict with a teammate and how you resolved it.',
        ['conflict', 'listen', 'perspective', 'resolution', 'outcome'],
        'Show that you sought the other perspective, separated people from the problem and reached an agreement that held afterwards.',
        ['conflict resolution', 'teamwork', 'behavioral']
      ),
      text(
        'Tell me about a time you missed a deadline. What did you do?',
        ['ownership', 'communication', 'prioritization', 'lesson', 'recovery'],
        'Own it without blame, explain how early you escalated, how you re-prioritised and what process change prevented a repeat.',
        ['ownership', 'accountability', 'behavioral']
      ),
      text(
        'How do you prioritise when everything is urgent?',
        ['impact', 'effort', 'stakeholder', 'trade-off', 'communication'],
        'Rank by impact versus effort and deadline risk, make the trade-off explicit to stakeholders and confirm what will be dropped.',
        ['prioritization', 'time management', 'communication']
      ),
      text(
        'Tell me about a time you received difficult feedback.',
        ['feedback', 'reaction', 'change', 'follow up', 'growth'],
        'Describe listening without defending, the concrete change you made and how you verified it improved.',
        ['feedback', 'growth mindset', 'behavioral']
      )
    ],
    Advanced: [
      text(
        'Tell me about a decision you made with incomplete information.',
        ['ambiguity', 'assumption', 'risk', 'reversible', 'outcome'],
        'State the assumptions, why waiting was worse, how reversible the decision was, and what you learned from the outcome.',
        ['decision making', 'ambiguity', 'leadership']
      ),
      text(
        'How have you influenced a technical decision without formal authority?',
        ['influence', 'data', 'stakeholder', 'proposal', 'buy-in'],
        'Build the case with data or a prototype, address each stakeholder concern and let the team own the conclusion.',
        ['influence', 'leadership', 'communication']
      ),
      text(
        'Describe a project that failed and what you would do differently.',
        ['failure', 'root cause', 'accountability', 'lesson', 'change'],
        'Be specific about your contribution to the failure, the root cause and the process you changed afterwards.',
        ['failure', 'retrospective', 'ownership']
      ),
      text(
        'How do you onboard and mentor a junior engineer?',
        ['mentoring', 'pairing', 'feedback', 'autonomy', 'milestone'],
        'Set 30/60/90 milestones, pair early, give frequent specific feedback and hand over autonomy as confidence grows.',
        ['mentoring', 'leadership', 'teamwork']
      )
    ]
  },

  'System Design': {
    Beginner: [
      mcq(
        'What does horizontal scaling mean?',
        ['Bigger machines', 'More machines behind a load balancer', 'More threads per process', 'Larger disks'],
        1,
        'Horizontal scaling adds instances (requiring stateless app servers); vertical scaling grows one machine.',
        ['scalability', 'architecture', 'fundamentals']
      ),
      mcq(
        'Which cache invalidation problem happens when many requests miss simultaneously for the same hot key?',
        ['Cache stampede', 'Cache warming', 'Write-through', 'Eviction'],
        0,
        'A stampede floods the origin; mitigate with request coalescing, locks or stale-while-revalidate.',
        ['caching', 'performance', 'reliability']
      ),
      text(
        'Explain the role of a load balancer and a health check.',
        ['load balancer', 'health check', 'distribution', 'failover', 'stateless'],
        'The balancer spreads traffic across healthy instances and removes failing ones based on health checks, which requires stateless app nodes.',
        ['load balancing', 'availability', 'architecture']
      ),
      text(
        'When would you use a message queue instead of a synchronous call?',
        ['queue', 'asynchronous', 'decoupling', 'spike', 'retry'],
        'For slow or bursty non-critical work: it decouples producer and consumer, absorbs spikes and enables retries without blocking the request.',
        ['messaging', 'architecture', 'resilience']
      )
    ],
    Intermediate: [
      mcq(
        'In CAP terms, what must a distributed system sacrifice during a network partition?',
        ['Consistency or availability', 'Durability', 'Latency only', 'Nothing'],
        0,
        'Under partition you must choose between rejecting requests (C) and serving possibly stale data (A).',
        ['cap theorem', 'distributed systems', 'consistency']
      ),
      text(
        'Design a URL shortener.',
        ['hash', 'collision', 'redirect', 'cache', 'sharding'],
        'Generate a short key (counter/base62 or hash with collision checks), store the mapping in a sharded KV store, serve 301/302 redirects from cache and track analytics asynchronously.',
        ['system design', 'storage', 'caching']
      ),
      text(
        'How would you design rate limiting for a public API?',
        ['token bucket', 'sliding window', 'redis', 'per key', '429'],
        'Token bucket or sliding-window counters in a shared store keyed per API key/IP, returning 429 with `Retry-After`, and enforced at the edge.',
        ['rate limiting', 'api design', 'distributed systems']
      ),
      text(
        'How do you keep a read replica lag problem from breaking user experience?',
        ['replication lag', 'read your writes', 'sticky', 'primary read', 'monitor'],
        'Route read-your-writes traffic to the primary or use sticky sessions/versioned reads, and monitor lag with automatic failback.',
        ['databases', 'replication', 'consistency']
      )
    ],
    Advanced: [
      mcq(
        'Which pattern prevents a failing dependency from exhausting all your threads?',
        ['Retry forever', 'Circuit breaker with bulkheads', 'Larger thread pool', 'Synchronous fan-out'],
        1,
        'Circuit breakers stop calling a broken dependency and bulkheads isolate its resource pool.',
        ['resilience', 'patterns', 'reliability']
      ),
      text(
        'Design a real-time notification system for 10 million users.',
        ['fan-out', 'websocket', 'pub sub', 'presence', 'delivery guarantee'],
        'Persistent connections (WebSocket/push) behind a connection tier, pub/sub fan-out with per-user queues, presence tracking and at-least-once delivery with dedupe.',
        ['system design', 'realtime', 'scalability']
      ),
      text(
        'How would you design multi-region active-active with acceptable consistency?',
        ['multi region', 'conflict resolution', 'latency', 'quorum', 'data locality'],
        'Partition by data locality, use quorum or CRDT/last-writer-wins conflict resolution per data type, and accept eventual consistency for cross-region writes.',
        ['distributed systems', 'availability', 'architecture']
      ),
      text(
        'How do you capacity plan and define SLOs for a new service?',
        ['slo', 'error budget', 'percentile', 'load test', 'headroom'],
        'Derive SLIs from user journeys, set p99 latency/availability SLOs with an error budget, load test to find the knee and keep headroom for failover.',
        ['sre', 'capacity planning', 'reliability']
      )
    ]
  },

  'DSA Round': {
    Beginner: [
      mcq(
        'What is the average time complexity of a hash-table lookup?',
        ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        0,
        'Hashing gives amortised O(1) average lookup, degrading to O(n) with pathological collisions.',
        ['hashing', 'complexity', 'data structures']
      ),
      mcq(
        'Which traversal of a binary search tree yields sorted order?',
        ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
        1,
        'In-order (left, node, right) visits BST keys in ascending order.',
        ['trees', 'traversal', 'bst']
      ),
      text(
        'Given an array and a target, return indices of the two numbers that sum to the target. Explain your approach and complexity.',
        ['hash map', 'complement', 'one pass', 'o(n)', 'space'],
        'Store seen values in a hash map and look up `target - num` in one pass: O(n) time, O(n) space.',
        ['arrays', 'hashing', 'two sum']
      ),
      text(
        'How do you reverse a singly linked list in place?',
        ['pointer', 'previous', 'iterative', 'o(1) space', 'null'],
        'Walk the list re-pointing each `next` to the previous node with three pointers: O(n) time, O(1) space.',
        ['linked list', 'pointers', 'in place']
      )
    ],
    Intermediate: [
      mcq(
        'Which technique solves "longest substring without repeating characters" in O(n)?',
        ['Brute force pairs', 'Sliding window with a last-seen map', 'Sorting', 'Binary search'],
        1,
        'Advance the right edge and jump the left edge past the previous occurrence of the repeated character.',
        ['sliding window', 'strings', 'hashing']
      ),
      text(
        'Explain how you would detect a cycle in a directed graph.',
        ['dfs', 'recursion stack', 'visited', 'topological sort', 'indegree'],
        'DFS tracking nodes on the recursion stack (a back edge means a cycle), or Kahn topological sort failing to emit all nodes.',
        ['graphs', 'dfs', 'topological sort']
      ),
      text(
        'Solve the coin change problem and state its complexity.',
        ['dynamic programming', 'subproblem', 'bottom up', 'memoization', 'o(n*amount)'],
        'Bottom-up DP over amounts: `dp[a] = min(dp[a - coin] + 1)`, O(amount × coins) time and O(amount) space.',
        ['dynamic programming', 'optimization', 'complexity']
      ),
      text(
        'How would you find the k largest elements in a large stream of numbers?',
        ['min heap', 'size k', 'streaming', 'o(n log k)', 'quickselect'],
        'Keep a size-k min-heap and evict the smallest: O(n log k) time and O(k) space; quickselect works for a static array.',
        ['heaps', 'streaming', 'selection']
      )
    ],
    Advanced: [
      mcq(
        'What is the time complexity of Dijkstra with a binary heap?',
        ['O(V^2)', 'O(E log V)', 'O(VE)', 'O(V + E)'],
        1,
        'Each edge may trigger a heap decrease-key/push, giving O(E log V).',
        ['graphs', 'shortest path', 'complexity']
      ),
      text(
        'Design a data structure supporting insert, delete and getRandom in O(1).',
        ['array', 'hash map', 'swap with last', 'index', 'o(1)'],
        'Pair a dynamic array with a value→index map; delete swaps the target with the last element and pops, keeping all operations O(1).',
        ['data structure design', 'hashing', 'arrays']
      ),
      text(
        'Find the median of two sorted arrays in logarithmic time and explain the invariant.',
        ['binary search', 'partition', 'invariant', 'log', 'median'],
        'Binary search the smaller array for a partition where left halves ≤ right halves; the median comes from the boundary values in O(log min(m, n)).',
        ['binary search', 'arrays', 'divide and conquer']
      ),
      text(
        'How would you approach an LRU cache and what makes each operation O(1)?',
        ['hash map', 'doubly linked list', 'eviction', 'recency', 'o(1)'],
        'A hash map to nodes of a doubly linked list: the map gives O(1) lookup and the list gives O(1) recency updates and tail eviction.',
        ['cache', 'data structure design', 'linked list']
      )
    ]
  }
};

/**
 * Flattens the bank into `Question` documents.
 */
function buildQuestionDocuments() {
  return Object.entries(bank).flatMap(([category, byDifficulty]) =>
    Object.entries(byDifficulty).flatMap(([difficulty, questions]) =>
      questions.map((question) => ({
        category,
        difficulty,
        isActive: true,
        aiGenerated: false,
        keywords: question.expectedKeywords,
        ...question
      }))
    )
  );
}

module.exports = { bank, buildQuestionDocuments };
