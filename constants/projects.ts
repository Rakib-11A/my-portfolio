/**
 * The Technical Archive — curated case studies of production systems
 * I have architected, shipped, and operated. Each entry is a deep-dive
 * into the engineering decisions, not a marketing blurb.
 */

export type ProjectCategory =
  | "FinTech"
  | "Cloud Infrastructure"
  | "Enterprise"
  | "Full-Stack SaaS";

export type ProjectRole =
  | "Lead Architect"
  | "Full-Stack Engineer"
  | "Backend Engineer"
  | "Cloud / DevOps Engineer"
  | "Security Engineer";

export type ProjectComplexity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TechStackItem {
  /** Canonical technology name as it appears in industry. */
  readonly name: string;
  /** Icon identifier — simple-icons slug, react-icons key, or local asset path. */
  readonly icon: string;
  /** The architectural justification for selecting this technology. */
  readonly reason: string;
}

export interface ProjectVisuals {
  /** Primary hero image — lives under /public. */
  readonly mainImage: string;
  /** System architecture / topology diagram. */
  readonly architectureDiagram: string;
  /** Entity Relationship Diagram for the persistence layer. */
  readonly erd: string;
  /** In-product screenshots used for the gallery carousel. */
  readonly screenshots: readonly string[];
}

export interface EngineeringNarrative {
  /** The core technical bottleneck or constraint that defined the project. */
  readonly challenge: string;
  /** Architectural approach, design patterns, and trade-offs taken. */
  readonly strategy: string;
  /** Quantifiable, business-aligned outcome of the work. */
  readonly result: string;
  /** Tight, scannable bullets that signal engineering depth. */
  readonly technicalFlex: readonly string[];
}

export interface ProjectCodeSnippet {
  /** Language identifier for the syntax highlighter (e.g. 'ts', 'nginx', 'yaml'). */
  readonly language: string;
  /** The most elegant or technically dense excerpt from the project. */
  readonly code: string;
  /** Short prose explaining *why* this excerpt is interesting. */
  readonly explanation: string;
}

export interface ProjectMetric {
  readonly label: string;
  readonly value: string;
}

export interface ProjectLinks {
  readonly github: string;
  readonly live: string;
  readonly docs?: string;
}

export interface Project {
  readonly id: string;
  readonly title: string;
  readonly category: ProjectCategory;
  readonly role: ProjectRole;
  readonly tagline: string;
  readonly description: string;
  readonly techStack: readonly TechStackItem[];
  readonly visuals: ProjectVisuals;
  readonly engineeringNarrative: EngineeringNarrative;
  readonly codeSnippet: ProjectCodeSnippet;
  readonly metrics: readonly ProjectMetric[];
  readonly complexity: ProjectComplexity;
  readonly links: ProjectLinks;
}

/* -------------------------------------------------------------------------- */
/*  Projects                                                                  */
/* -------------------------------------------------------------------------- */

const planora: Project = {
  id: "planora",
  title: "Planora",
  category: "Full-Stack SaaS",
  role: "Lead Architect",
  tagline:
    "Self-hosted, containerized productivity platform — owned end-to-end from the kernel to the keystroke.",
  description:
    "A full-stack planning suite engineered as a single deployable unit and operated on a personal VPS. Every layer — TLS termination, reverse proxy, container orchestration, observability, and CI/CD — was architected and tuned by hand to validate first-principles ownership of the entire delivery pipeline.",
  techStack: [
    {
      name: "Next.js (App Router)",
      icon: "nextdotjs",
      reason:
        "Server Components reduce client-side JS by ~40%, and the streaming render model lets the dashboard hydrate progressively under constrained VPS bandwidth.",
    },
    {
      name: "Node.js + Express",
      icon: "nodedotjs",
      reason:
        "Lean, predictable runtime that pairs naturally with the event-driven I/O profile of a planning workload dominated by short, bursty requests.",
    },
    {
      name: "PostgreSQL",
      icon: "postgresql",
      reason:
        "Chosen for transactional integrity and rich indexing — the planner's recurrence and timezone logic benefits from native interval and tstzrange support.",
    },
    {
      name: "Docker + Docker Compose",
      icon: "docker",
      reason:
        "Declarative, reproducible topology. Compose codifies the entire production graph (web, api, db, redis, nginx) into a single source of truth.",
    },
    {
      name: "Nginx",
      icon: "nginx",
      reason:
        "Battle-tested reverse proxy. Terminates TLS, applies HTTP/2, gzip, and per-route rate limits, and gates upstreams with health-aware load balancing.",
    },
    {
      name: "GitHub Actions",
      icon: "githubactions",
      reason:
        "Push-to-deploy CI/CD: typecheck, test, build OCI image, push to registry, and SSH-deploy with zero-downtime container swap.",
    },
    {
      name: "Let's Encrypt + Certbot",
      icon: "letsencrypt",
      reason:
        "Automated, auto-renewing TLS — eliminates a recurring class of operational risk for a self-hosted deployment.",
    },
  ],
  visuals: {
    mainImage: "/images/projects/planora/cover.webp",
    architectureDiagram: "/images/projects/planora/architecture.svg",
    erd: "/images/projects/planora/erd.svg",
    screenshots: [
      "/images/projects/planora/screen-dashboard.webp",
      "/images/projects/planora/screen-planner.webp",
      "/images/projects/planora/screen-analytics.webp",
    ],
  },
  engineeringNarrative: {
    challenge:
      "Deliver a production-grade SaaS experience on a single low-resource VPS without sacrificing zero-downtime deploys, TLS hygiene, or observability — and prove it could be operated by one engineer.",
    strategy:
      "Architected a containerized topology orchestrated via Docker Compose and fronted by an Nginx reverse proxy performing TLS termination, HTTP/2 upgrade, and intelligent upstream routing. Engineered a GitHub Actions pipeline that builds immutable OCI images, ships them via SSH, and performs a health-checked rolling swap to guarantee continuity.",
    result:
      "Achieved 99.9% uptime over a 6-month operational window with sub-200ms TTFB on the primary dashboard, while reducing release lead time from manual ~30 minutes to a fully automated ~90 seconds.",
    technicalFlex: [
      "Engineered an Nginx reverse-proxy configuration with HTTP/2, gzip, per-route rate limiting, and health-aware upstream selection.",
      "Orchestrated a multi-service Docker Compose stack (web, api, db, redis, nginx) with isolated networks and named volumes for state durability.",
      "Implemented a zero-downtime CI/CD pipeline in GitHub Actions: build → push → SSH-deploy → health-check → cutover.",
      "Hardened the VPS with UFW, fail2ban, key-only SSH, and auto-renewing Let's Encrypt certificates.",
      "Instrumented the stack with structured JSON logging and container-level resource quotas to operate within a constrained memory envelope.",
    ],
  },
  codeSnippet: {
    language: "nginx",
    code: `# /etc/nginx/sites-available/planora.conf
upstream planora_web { server web:3000; keepalive 32; }
upstream planora_api { server api:4000; keepalive 32; }

limit_req_zone $binary_remote_addr zone=api_zone:10m rate=30r/s;

server {
  listen 443 ssl http2;
  server_name planora.example.com;

  ssl_certificate     /etc/letsencrypt/live/planora.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/planora.example.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  gzip on;
  gzip_types application/json text/css application/javascript image/svg+xml;

  location /api/ {
    limit_req zone=api_zone burst=60 nodelay;
    proxy_pass http://planora_api/;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }

  location / {
    proxy_pass http://planora_web;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}

server {
  listen 80;
  server_name planora.example.com;
  return 301 https://$host$request_uri;
}`,
    explanation:
      "A single, tuned Nginx vhost that fronts both the Next.js web tier and the Express API. It performs TLS 1.3 termination, enforces HSTS, applies token-bucket rate limiting on the API surface, and uses upstream keepalive pools to amortize connection setup — all of the production hygiene you would expect from a managed gateway, expressed in 30 lines of declarative config.",
  },
  metrics: [
    { label: "Uptime (6mo)", value: "99.9%" },
    { label: "P50 TTFB", value: "180ms" },
    { label: "Release Lead Time", value: "~90s" },
    { label: "VPS Memory Footprint", value: "< 1.2 GB" },
  ],
  complexity: 8,
  links: {
    github: "https://github.com/Rakib-11A/planora",
    live: "https://168.144.44.150",
    docs: "https://github.com/Rakib-11A/planora#readme",
  },
};

const nexusMed: Project = {
  id: "nexus-med",
  title: "NexusMed (PH-HealthCare)",
  category: "Enterprise",
  role: "Backend Engineer",
  tagline:
    "Enterprise-grade healthcare backbone — layered architecture, sub-millisecond reads, and HIPAA-aligned document handling.",
  description:
    "An enterprise health platform for clinics and patients, designed around a strict Controller → Service → Repository separation. The system fuses Redis-backed read paths for hot patient records with S3-backed cold storage for medical documents, delivering both responsiveness at the bedside and compliance-grade durability for clinical artifacts.",
  techStack: [
    {
      name: "Node.js + Express",
      icon: "nodedotjs",
      reason:
        "Mature middleware ecosystem made it straightforward to enforce a uniform Controller → Service → Repository pipeline across dozens of endpoints.",
    },
    {
      name: "TypeScript",
      icon: "typescript",
      reason:
        "Domain types (Patient, Encounter, Prescription) are surfaced end-to-end, eliminating the entire class of runtime shape errors typical in healthcare payloads.",
    },
    {
      name: "PostgreSQL + Prisma",
      icon: "prisma",
      reason:
        "Prisma's migration story and typed client align with the domain-driven layering — repositories become trivially testable and schema drift is caught at compile time.",
    },
    {
      name: "Redis",
      icon: "redis",
      reason:
        "Cache-aside layer for patient demographics and recent encounters — collapses repeat reads from ~80ms (DB) to ~2ms (memory).",
    },
    {
      name: "AWS S3",
      icon: "amazons3",
      reason:
        "Versioned, encrypted object storage for prescriptions, lab reports, and imaging — accessed exclusively via short-TTL pre-signed URLs.",
    },
    {
      name: "JWT + RBAC",
      icon: "jsonwebtokens",
      reason:
        "Role-aware access tokens enforce the least-privilege boundary between Patient, Doctor, and Admin surfaces at the controller edge.",
    },
  ],
  visuals: {
    mainImage: "/images/projects/nexus-med/cover.webp",
    architectureDiagram: "/images/projects/nexus-med/architecture.svg",
    erd: "/images/projects/nexus-med/erd.svg",
    screenshots: [
      "/images/projects/nexus-med/screen-records.webp",
      "/images/projects/nexus-med/screen-appointments.webp",
      "/images/projects/nexus-med/screen-admin.webp",
    ],
  },
  engineeringNarrative: {
    challenge:
      "Patient record retrieval was bottlenecked by repeated, identical reads against a normalized relational schema, and unbounded growth of medical documents threatened both database size and durability guarantees.",
    strategy:
      "Architected a strict Controller → Service → Repository pipeline so caching and storage concerns could be isolated at the service layer without bleeding into route handlers. Introduced a Redis cache-aside layer keyed by patient identity with explicit invalidation on mutations, and offloaded all binary medical artifacts to S3 behind short-TTL pre-signed URLs.",
    result:
      "Reduced average patient-record read latency from ~80ms to ~6ms (a 13x improvement), eliminated database bloat from binary blobs entirely, and produced an auditable, role-gated access trail for every clinical document.",
    technicalFlex: [
      "Enforced Controller → Service → Repository layering with dependency-injected repositories for first-class unit testability.",
      "Implemented a Redis cache-aside policy with deterministic cache keys and write-through invalidation on mutating endpoints.",
      "Architected secure S3 document storage with server-side encryption (SSE-S3) and short-TTL pre-signed URLs for zero-leak delivery.",
      "Modeled RBAC at the controller boundary so authorization is a precondition of route resolution, not an afterthought.",
      "Designed schemas with Prisma migrations versioned alongside the application — every deploy is schema-aware.",
    ],
  },
  codeSnippet: {
    language: "ts",
    code: `// services/patient.service.ts
import { redis } from "@/lib/redis";
import { PatientRepository } from "@/repositories/patient.repository";
import type { Patient } from "@prisma/client";

const TTL_SECONDS = 60 * 5;
const key = (id: string) => \`patient:\${id}\`;

export class PatientService {
  constructor(private readonly repo: PatientRepository) {}

  async getById(id: string): Promise<Patient | null> {
    const cached = await redis.get(key(id));
    if (cached) return JSON.parse(cached) as Patient;

    const patient = await this.repo.findById(id);
    if (patient) {
      await redis.set(key(id), JSON.stringify(patient), "EX", TTL_SECONDS);
    }
    return patient;
  }

  async update(id: string, patch: Partial<Patient>): Promise<Patient> {
    const updated = await this.repo.update(id, patch);
    // Write-through invalidation: never serve a stale clinical record.
    await redis.del(key(id));
    return updated;
  }
}`,
    explanation:
      "A textbook cache-aside implementation with one non-negotiable rule for healthcare: every mutation invalidates the cache *before* returning. The Service is the only layer that knows Redis exists — controllers stay thin, repositories stay pure, and the caching policy is one file you can audit in isolation.",
  },
  metrics: [
    { label: "Patient Read Latency", value: "80ms → 6ms" },
    { label: "Cache Hit Ratio", value: "94%" },
    { label: "Document Durability", value: "11 nines (S3)" },
    { label: "Endpoints (RBAC-gated)", value: "60+" },
  ],
  complexity: 9,
  links: {
    github: "https://github.com/Rakib-11A/ph-healthcare",
    live: "",
    docs: "https://github.com/Rakib-11A/ph-healthcare#readme",
  },
};

const nagadAutoLifting: Project = {
  id: "nagad-auto-lifting",
  title: "Nagad Auto Lifting",
  category: "FinTech",
  role: "Security Engineer",
  tagline:
    "Cryptographic settlement bridge between a national MFS and a Core Banking System — zero tolerance for replay, drift, or repudiation.",
  description:
    "A FinTech integration that automates fund-lifting between Nagad (a national mobile financial service) and a partner bank's Core Banking System. Every transaction traverses a multi-stage cryptographic pipeline — RSA-SHA256 handshake, AES-128-CBC payload encryption, and HMAC-SHA256 message integrity — with deterministic idempotency and full reconciliation against the bank's CBS.",
  techStack: [
    {
      name: "Node.js + TypeScript",
      icon: "typescript",
      reason:
        "Strong typing on cryptographic envelopes is non-negotiable — the compiler enforces that signed payloads can never be confused with their plaintexts.",
    },
    {
      name: "Node crypto (RSA-SHA256)",
      icon: "openssl",
      reason:
        "Asymmetric handshake establishes mutual authenticity between the gateway and Nagad before any session key is exchanged.",
    },
    {
      name: "AES-128-CBC",
      icon: "openssl",
      reason:
        "Symmetric block cipher mandated by the Nagad protocol spec for payload-level confidentiality of the transaction envelope.",
    },
    {
      name: "HMAC-SHA256",
      icon: "openssl",
      reason:
        "Authenticates each request body so any in-flight tampering is detected and rejected before the CBS is contacted.",
    },
    {
      name: "Bank CBS API",
      icon: "swift",
      reason:
        "The settlement system of record. Every successful Nagad lift is mirrored as a posting against the customer's bank account.",
    },
    {
      name: "PostgreSQL",
      icon: "postgresql",
      reason:
        "ACID guarantees and serializable isolation underpin the idempotency table — the single source of truth for 'has this transaction been processed?'",
    },
  ],
  visuals: {
    mainImage: "/images/projects/nagad/cover.webp",
    architectureDiagram: "/images/projects/nagad/crypto-pipeline.svg",
    erd: "/images/projects/nagad/erd.svg",
    screenshots: [
      "/images/projects/nagad/screen-dashboard.webp",
      "/images/projects/nagad/screen-reconciliation.webp",
    ],
  },
  engineeringNarrative: {
    challenge:
      "Move customer funds between an MFS and a bank's Core Banking System under a cryptographic protocol that demands per-transaction key material, payload encryption, and signed envelopes — while guaranteeing exactly-once settlement across two independent ledgers.",
    strategy:
      "Architected a layered cryptographic pipeline: an RSA-SHA256 handshake establishes mutual identity, AES-128-CBC encrypts the transaction payload, and HMAC-SHA256 binds the request body to its signature. Wrapped the entire flow in an idempotency-key state machine persisted to Postgres, so a retried request is mathematically incapable of producing a duplicate CBS posting.",
    result:
      "Delivered a settlement bridge with zero double-postings observed in production, sub-second median end-to-end latency including CBS round-trip, and a fully reconcilable audit trail against both the Nagad and bank ledgers.",
    technicalFlex: [
      "Implemented RSA-SHA256 handshake for mutual authentication of the gateway and the Nagad endpoint.",
      "Engineered AES-128-CBC payload encryption with per-request IVs and constant-time padding handling.",
      "Mitigated request-tampering and replay risk via HMAC-SHA256 envelope signing bound to a monotonic nonce.",
      "Architected an idempotency-key state machine in Postgres under SERIALIZABLE isolation to guarantee exactly-once CBS posting.",
      "Integrated the bank's Core Banking System with circuit-breaker, exponential backoff, and dead-letter reconciliation queues.",
      "Instrumented the cryptographic pipeline with redacted, structured audit logs — every signature verification is observable, no key material is ever logged.",
    ],
  },
  codeSnippet: {
    language: "ts",
    code: `// crypto/nagad-envelope.ts
import { createCipheriv, createHmac, createSign, randomBytes } from "node:crypto";

interface SealedEnvelope {
  payload: string;     // base64( AES-128-CBC( JSON ) )
  iv: string;          // base64 IV (16 bytes)
  signature: string;   // base64 RSA-SHA256 over (payload || iv || nonce)
  hmac: string;        // hex HMAC-SHA256 over the canonical request
  nonce: string;       // monotonic, single-use
}

export function sealRequest<T>(
  body: T,
  aesKey: Buffer,        // 16 bytes
  rsaPrivateKeyPem: string,
  hmacSecret: string,
): SealedEnvelope {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-128-cbc", aesKey, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(body), "utf8"),
    cipher.final(),
  ]);

  const nonce = \`\${Date.now()}-\${randomBytes(8).toString("hex")}\`;
  const payload = ciphertext.toString("base64");
  const ivB64 = iv.toString("base64");

  const signer = createSign("RSA-SHA256");
  signer.update(\`\${payload}.\${ivB64}.\${nonce}\`);
  const signature = signer.sign(rsaPrivateKeyPem, "base64");

  const hmac = createHmac("sha256", hmacSecret)
    .update(\`\${payload}.\${ivB64}.\${nonce}.\${signature}\`)
    .digest("hex");

  return { payload, iv: ivB64, signature, hmac, nonce };
}`,
    explanation:
      "Three independent cryptographic primitives, each defending a different threat: AES-128-CBC for confidentiality, RSA-SHA256 for non-repudiation, HMAC-SHA256 for body integrity — all bound together by a single-use nonce that makes replay attacks computationally pointless. The signature inputs are canonicalized in a fixed order so a malicious proxy cannot rearrange fields to forge a valid envelope.",
  },
  metrics: [
    { label: "Double-Postings (prod)", value: "0" },
    { label: "Median E2E Latency", value: "< 1s" },
    { label: "Cryptographic Algorithms", value: "RSA-SHA256 / AES-128-CBC / HMAC-SHA256" },
    { label: "Reconciliation Drift", value: "0.00%" },
  ],
  complexity: 10,
  links: {
    github: "https://github.com/Rakib-11A/nagad-auto-lifting",
    live: "",
  },
};

const syfMart: Project = {
  id: "syfmart",
  title: "SyfMart",
  category: "Cloud Infrastructure",
  role: "Cloud / DevOps Engineer",
  tagline:
    "Cloud-native commerce platform on AWS — from the public DNS edge to a Multi-AZ relational core, every hop is engineered for failure.",
  description:
    "A production-grade e-commerce stack architected on AWS as a textbook cloud-native topology: Route 53 → CloudFront → ALB → ECS Fargate → Multi-AZ RDS. Every layer is horizontally scalable, every dependency is highly available, and every deploy is an immutable container image promoted through an environment-aware pipeline.",
  techStack: [
    {
      name: "Amazon Route 53",
      icon: "amazonroute53",
      reason:
        "Authoritative DNS with health-checked failover routing — the entry point that decides which Region or environment receives traffic.",
    },
    {
      name: "Amazon CloudFront",
      icon: "amazoncloudfront",
      reason:
        "Global CDN edge: TLS termination at the POP, static-asset caching, and origin shielding for the ALB.",
    },
    {
      name: "AWS ALB",
      icon: "amazonaws",
      reason:
        "Layer-7 load balancing with path-based routing across ECS target groups, plus native WAF integration for OWASP rule sets.",
    },
    {
      name: "Amazon ECS on Fargate",
      icon: "amazonecs",
      reason:
        "Serverless container compute — eliminates node patching while preserving full ECS task-definition control over CPU, memory, and IAM.",
    },
    {
      name: "Amazon RDS (Multi-AZ)",
      icon: "amazonrds",
      reason:
        "Synchronous standby in a second Availability Zone provides automated failover with single-digit-second RTO for the primary data store.",
    },
    {
      name: "AWS Secrets Manager",
      icon: "amazonaws",
      reason:
        "Runtime injection of database credentials and third-party API keys — secrets never live in a container image or environment file.",
    },
    {
      name: "Terraform",
      icon: "terraform",
      reason:
        "Entire topology codified as IaC — the production environment is reproducible from a clean account in under 20 minutes.",
    },
    {
      name: "Amazon CloudWatch",
      icon: "amazoncloudwatch",
      reason:
        "Centralized metrics, structured logs, and alarms wired to ECS service auto-scaling triggers and on-call paging.",
    },
  ],
  visuals: {
    mainImage: "/images/projects/syfmart/cover.webp",
    architectureDiagram: "/images/projects/syfmart/aws-architecture.svg",
    erd: "/images/projects/syfmart/erd.svg",
    screenshots: [
      "/images/projects/syfmart/screen-storefront.webp",
      "/images/projects/syfmart/screen-checkout.webp",
      "/images/projects/syfmart/screen-admin.webp",
    ],
  },
  engineeringNarrative: {
    challenge:
      "Deliver an e-commerce platform that survives a full Availability Zone outage, absorbs flash-sale traffic without manual intervention, and exposes a single, low-latency endpoint to a globally distributed audience.",
    strategy:
      "Architected a multi-tier AWS topology: Route 53 health-checked DNS at the edge, CloudFront for global TLS termination and static caching, an ALB performing path-based Layer-7 routing into ECS Fargate services, and a Multi-AZ RDS instance as the durable system of record. Every tier is independently auto-scaled, codified in Terraform, and observable through CloudWatch.",
    result:
      "Sustained a load test of 10,000 concurrent users with zero 5xx errors, validated automated AZ failover with sub-30-second RTO, and reduced infrastructure provisioning time from weeks of click-ops to a 20-minute Terraform apply.",
    technicalFlex: [
      "Architected the Route 53 → CloudFront → ALB → ECS Fargate → Multi-AZ RDS topology with isolated public, private, and data subnets across two AZs.",
      "Leveraged ECS Fargate target tracking on CPU and ALB request count for horizontal auto-scaling without node-level toil.",
      "Mitigated single-AZ failure risk via RDS Multi-AZ synchronous replication with automated DNS-level failover.",
      "Hardened the edge with AWS WAF managed rule groups, CloudFront origin access control, and TLS 1.2+ only.",
      "Codified the entire environment in Terraform modules — VPC, ECS, RDS, IAM, and observability — for one-command reproducibility.",
      "Wired CloudWatch alarms to ECS service scaling and SNS-paged on-call for SLO breaches.",
    ],
  },
  codeSnippet: {
    language: "hcl",
    code: `# terraform/ecs_service.tf
resource "aws_ecs_service" "syfmart_api" {
  name            = "syfmart-api"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.api.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 4000
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  lifecycle { ignore_changes = [desired_count] } # owned by autoscaling
}

resource "aws_appautoscaling_target" "api" {
  max_capacity       = 20
  min_capacity       = 2
  resource_id        = "service/\${aws_ecs_cluster.this.name}/\${aws_ecs_service.syfmart_api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api_cpu" {
  name               = "syfmart-api-cpu-tt"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 55.0
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    scale_in_cooldown  = 120
    scale_out_cooldown = 30
  }
}`,
    explanation:
      "An ECS Fargate service wired into ALB target groups with deployment circuit breakers and rollback enabled — a bad image is pulled back automatically. Target-tracking auto-scaling on CPU keeps the fleet honest under flash-sale traffic, and `ignore_changes` on `desired_count` cleanly hands runtime ownership of capacity to the autoscaler instead of fighting it on every Terraform apply.",
  },
  metrics: [
    { label: "Concurrent Users (load-tested)", value: "10,000" },
    { label: "AZ Failover RTO", value: "< 30s" },
    { label: "Provisioning Time (clean account)", value: "~20m" },
    { label: "5xx Rate (peak)", value: "0.00%" },
  ],
  complexity: 9,
  links: {
    github: "https://github.com/Rakib-11A/syfmart",
    live: "",
    docs: "https://github.com/Rakib-11A/syfmart#readme",
  },
};

/* -------------------------------------------------------------------------- */
/*  Public exports                                                            */
/* -------------------------------------------------------------------------- */

export const PROJECTS: readonly Project[] = [
  planora,
  nexusMed,
  nagadAutoLifting,
  syfMart,
];

export const PROJECTS_BY_ID: Readonly<Record<string, Project>> =
  Object.freeze(
    PROJECTS.reduce<Record<string, Project>>((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {}),
  );

export function getProjectById(id: string): Project | undefined {
  return PROJECTS_BY_ID[id];
}
