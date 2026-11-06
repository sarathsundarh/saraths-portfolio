// AI Sarath's knowledge base: the only facts the model may use.
// Public-safe by design: no phone number, no visa or eligibility details, no internal notes.
// `target` is the element on the homepage a citation chip scrolls to.

export const KB = [
  {
    id: 'profile', title: 'About Sarath', target: '#about',
    text: `Sarath Sundar Harisaravanan is an MS Computer Science student at the University of Southern California (USC) in Los Angeles, expected to graduate in May 2028. He has more than two years of full-time backend and AI software work at IDFC FIRST Bank in Bangalore, India, preceded by an internship there. He builds useful software around real business workflows, works across backend systems and applied AI, and likes turning unfamiliar problems into working tools. Most recently he built Drigil with a three-person team, earning 2nd place in Anthropic's Claude for Public Benefit track at Cal Hacks 13.0.`,
  },
  {
    id: 'availability', title: 'Availability and contact', target: '#contact',
    text: `Roles Sarath is seeking: Summer 2027 internships (intern positions) in software engineering and applied AI. He is looking for these internships and is available roughly from mid-May through the end of August 2027. Contact: email harisara@usc.edu, LinkedIn linkedin.com/in/sarathsundarh, GitHub github.com/sarathsundarh. He is based in Los Angeles, California. Questions about work authorization or sponsorship should go to Sarath directly by email.`,
  },
  {
    id: 'education', title: 'Education', target: '#education',
    text: `USC: Master of Science in Computer Science, Los Angeles, expected May 2028. Coursework includes Analysis of Algorithms and Information Retrieval and Web Search Engines. PES University, Bangalore: B.Tech. in Computer Science and Engineering, May 2024, GPA 3.7/4.0. PES coursework included Data Structures and Its Applications, Compiler Design, Operating Systems, Big Data and Deep Learning. There is no USC GPA on record.`,
  },
  {
    id: 'idfc-role', title: 'IDFC FIRST Bank · role', target: '#x-idfc',
    text: `Sarath was an Application Engineer at IDFC FIRST Bank in Bangalore, India, from July 2024 to August 2026, after an internship from January to June 2024. His contributions span both the internship and the full-time role. The bank's systems serve more than five million customers; he worked on parts of them as one engineer on the team, not all of them himself.`,
  },
  {
    id: 'idfc-mcp', title: 'IDFC · Go MCP server', target: '#x-mcp',
    text: `At IDFC FIRST Bank, Sarath built a Go MCP (Model Context Protocol) server with the engineering team. It exposed enterprise capabilities as tools AI agents could call, across banking domains including CRM, asset management, gold loans, property loans and charge waivers. The team chose a shared tool layer over per-agent API integrations for typed schemas, centralized authentication and reuse across agents, accepting the cost of an extra network hop and another service to maintain. It cut CRM and asset-management lookups from minutes to under 5 seconds. Specific auth protocols, schema libraries or hosting details are not in these notes.`,
  },
  {
    id: 'idfc-demo', title: 'IDFC · demos to the business', target: '#x-idfc',
    text: `Sarath demoed the loan and asset lookup tools to product and business teams, explained their limits and failure cases, refined tool outputs using their feedback, and received recognition for the demo at a Quarterly Review. This was recognition for a presentation, not a formal named company award.`,
  },
  {
    id: 'idfc-cheque', title: 'IDFC · cheque extraction prototype', target: '#x-idfc',
    text: `Sarath prototyped LLM-based cheque field extraction with MiniMax M2.5 to support compliance-document automation in the CRM. It was a prototype; no measured accuracy or production rollout is recorded. He also has broader multimodal LLM and NLP experience at IDFC.`,
  },
  {
    id: 'idfc-services', title: 'IDFC · microservices and Kafka', target: '#x-idfc',
    text: `Sarath developed Go and Python services in a microservices architecture, routing REST APIs through Kong with authentication and rate limiting, and added Kafka retry handling to improve resilience during upstream outages. He also used Apache Spark in ETL work at IDFC; further pipeline details are not in these notes.`,
  },
  {
    id: 'idfc-sql', title: 'IDFC · SQL tuning', target: '#x-sql',
    text: `Sarath delivered tested, documented banking features with product and business teams, and tuned SQL queries and indexes over 50M+ records, cutting API response times by 42%.`,
  },
  {
    id: 'idfc-obs', title: 'IDFC · observability', target: '#x-obs',
    text: `Sarath set up service observability through automated monitoring and failure tracing across internal and third-party integrations, helping cut incident resolution time by 35%.`,
  },
  {
    id: 'elementals', title: 'ElementalsAI internship', target: '#x-elem',
    text: `AI Research Intern at ElementalsAI, Bangalore, June to August 2023. Sarath built and evaluated Python multimodal LLM applications using Hugging Face, scikit-learn and the OpenAI API, and benchmarked foundation models across transformer and generative architectures. He explained AI concepts through a 12-module curriculum with 25+ exercises and documented implementation examples. It was not a research publication.`,
  },
  {
    id: 'drigil', title: 'Drigil · overview', target: '#p-drigil', href: 'https://devpost.com/software/drigil',
    text: `Drigil won 2nd place in Anthropic's Claude for Public Benefit track at Cal Hacks 13.0 (October 2026). It is a track placement, not an overall hackathon placement. Built over 36 hours at the Palace of Fine Arts in San Francisco by a three-person team: Sarath Sundar Harisaravanan, Shraddha Khanapur and Michael Kim. Drigil uses smart glasses to coach people with intellectual and developmental disabilities through a new job, in their supervisor's own voice. It is a hackathon prototype; no clinical study or measured user outcomes are recorded. Which components Sarath personally built is not recorded; it is a team project.`,
  },
  {
    id: 'drigil-how', title: 'Drigil · how it works', target: '#p-drigil', href: 'https://devpost.com/software/drigil',
    text: `Drigil has three loops. Teach once: a supervisor narrates one demonstration; Drigil picks keyframes where the hands pause, aligns them with a word-level transcript from Cartesia ink-whisper, and Claude turns them into a structured task specification. Coach live: Claude runs confidence-gated vision checks on the camera feed, coaching plays in a cloned supervisor voice through Cartesia with audio cached per line, and a mastery model reduces prompting as the worker gets up to speed. Fix what breaks: if a step keeps causing difficulty, Factory Droid starts a sandboxed agent that rewrites that step; the supervisor reviews a before-and-after comparison and must approve it before it goes live. Stack: Claude, Cartesia, SpacetimeDB, Moss, Factory Droid, Notability.`,
  },
  {
    id: 'reglens', title: 'RegLens', target: '#p-reglens',
    text: `RegLens (2026 to present) is an AI policy-review platform in Python with LangGraph, LangChain, pgvector and PostgreSQL. It checks internal policies against regulatory requirements, retrieves evidence from 25,000+ documents and flags gaps with citations, routing remediation through human approval. It orchestrates four LangGraph agents and has a 500+ query evaluation harness measuring 92% recall@5 and 96% citation accuracy. Integration with Palantir Foundry and AIP ontology modeling is in progress, not finished. There is no public repository.`,
  },
  {
    id: 'nftgenesis', title: 'NFTGenesis · IEEE paper', target: '#p-nft', href: 'https://ieeexplore.ieee.org/document/10649392',
    text: `NFTGenesis (September 2024) is an image generation and authentication platform built by a four-person team in Python with PyTorch, Stable Diffusion, QLoRA and CNNs. Fine-tuning Stable Diffusion with QLoRA reduced trainable parameters by over 90%. Paired encoder and decoder CNNs embed tamper-evident image signatures with 98% verification accuracy. Sarath authored the paper with the team: "NFTGenesis: An NFT Generation and Authentication System with Market Intelligence Using Deep Learning Based Steganography", IEEE InC4 2024.`,
  },
  {
    id: 'kafka', title: 'Yet Another Kafka', target: '#p-kafka', href: 'https://github.com/sarathsundarh/BD_yetanother_kafka',
    text: `Yet Another Kafka (2023) is a distributed publish-subscribe message broker Sarath built in Java with raw TCP sockets and multithreading, without external frameworks. By his account it handled 20+ topics, 80+ partitions with persistent offset tracking, 250+ concurrent clients, 35,000+ messages per second and sub-50 ms p95 latency; he profiled and debugged bottlenecks along the way. Durability guarantees, replication and benchmark hardware are not described in these notes.`,
  },
  {
    id: 'mend', title: 'Mend · USC Origin finalist', target: '#p-mend', href: 'https://devpost.com/software/mend-do4rht',
    text: `Mend was a finalist (Top 15 teams) at the USC Origin Hackathon 2026, built by a five-person team: Sarath Sundar Harisaravanan, Anshuman Shrivastav, Dongyeop Lee, Srinivas Patnaik Balivada and Pablo Valdes. It turns one photo of street damage into a verified repair report: an iOS app (SwiftUI) with on-device damage models, server-side vision verification and a city work-queue dashboard on Supabase. Sarath built the pricing and rewards engine: surge pricing over H3 hexagons (about a city block each) where a live 1x to 5x multiplier rises where coverage is thin or stale and cools as reports pile up; one shared module prices both the map and the payout, and each report is priced before it is saved. He also wrote the reward rate card (severity x asset tier x first finder x zone, with a daily cap), itemized receipts, bounty budgets and pay-per-visit sponsored campaigns with geofenced check-ins, covered by 11 Deno unit tests and 39 end-to-end database checks. Teammates built the iOS app, the damage models and the verification flow.`,
  },
  {
    id: 'caldera', title: 'Caldera', target: '#projects',
    text: `Caldera (June 2025) is a full-stack spend-management app in TypeScript, Next.js, React, PostgreSQL and Tailwind CSS, with transaction entry, categorization, search and filtering, type-safe APIs and reusable dashboards. It has 35+ automated tests, and load tests showed a 65% reduction in p95 latency to under 250 ms. It is not shown on this page.`,
  },
  {
    id: 'ml-projects', title: 'Data science projects', target: '#projects', href: 'https://github.com/sarathsundarh/nifty50_pred',
    text: `NIFTY 50 forecasting: an LSTM forecasting prototype in Python with TensorFlow/Keras on minute-level market data, with sliding-window sequences, a chronological split, prediction plots and recursive multi-step forecasts. It is a prototype, not validated backtesting or a trading result. Exoplanet habitability classification (2023): exploratory analysis and a comparison of Logistic Regression and Balanced Random Forest under severe class imbalance, using confusion matrices to weigh false positives against false negatives. Neither project has headline accuracy numbers to quote.`,
  },
  {
    id: 'skills', title: 'Skills', target: '#stack',
    text: `Languages: Python, SQL, Go, Java, TypeScript, JavaScript. Backend and systems: microservices, REST APIs, Kong, Kafka, PostgreSQL and PostGIS, SQL indexing, monitoring and failure tracing, TCP sockets, multithreading. Applied AI: MCP, LLM APIs, LangGraph, LangChain, RAG, pgvector, evaluation harnesses, human-in-the-loop workflows, multimodal LLMs, Claude, Cartesia. ML: PyTorch, scikit-learn, Hugging Face, TensorFlow/Keras, LSTMs, CNNs, Stable Diffusion, QLoRA. Product: React, Next.js, Swift/SwiftUI, Deno, Supabase, testing, technical documentation, stakeholder demos, AI-assisted development.`,
  },
  {
    id: 'awards', title: 'Achievements', target: '#achievements',
    text: `2nd place, Anthropic's Claude for Public Benefit track, Cal Hacks 13.0 (2026), for Drigil. Finalist, Top 15 teams, USC Origin Hackathon (2026), for Mend. 1st place at SpaceJam (2021), the hackathon run by the Hackerspace club. Seven merit scholarships. Junior Lead, PredictThis AI Club. Publication: NFTGenesis, IEEE InC4 2024.`,
  },
  {
    id: 'workflow', title: 'How Sarath builds with AI agents', target: '#notes',
    text: `Sarath uses AI-assisted development. After an Anthropic multi-agent workshop he described his approach: a read-only critic agent that reviews changes, shared rules in a CLAUDE.md file, and fewer agents with clearer briefs and deadlines, which he found led to fewer broken handoffs and less rework. No measured speedup is recorded.`,
  },
  {
    id: 'ai-sarath', title: 'How this chat works', target: '#ask',
    text: `The chat on this page is an AI assistant that answers in Sarath's voice from a curated knowledge base of facts about his work, retrieved with BM25, using a Gemini model on a Vercel serverless function. Answers list the facts they used; the server drops any citation that wasn't retrieved, the page can scroll to what it cites, inputs are length- and rate-limited, and it says so when the knowledge base doesn't cover something. It can make mistakes, so the linked sources are there to verify details.`,
  },
];

export const PROFILE_ID = 'profile';

// homepage anchors the model may point the page at
export const TARGETS = {
  about: '#about', ask: '#ask', projects: '#projects', experience: '#experience', education: '#education',
  stack: '#stack', achievements: '#achievements', notes: '#notes', contact: '#contact',
  drigil: '#p-drigil', reglens: '#p-reglens', nftgenesis: '#p-nft', kafka: '#p-kafka', mend: '#p-mend',
  'idfc-mcp': '#x-mcp', 'idfc-sql': '#x-sql', 'idfc-obs': '#x-obs', idfc: '#x-idfc', elementals: '#x-elem',
};
