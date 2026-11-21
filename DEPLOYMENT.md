# CI/CD and AWS deployment

## Files and responsibilities

- `docker-compose.yml`: local PostgreSQL, Redis and all five runnable application services; Compose provides their private DNS/network.
- `.dockerignore`: keeps dependencies, build output, Python virtualenvs and local environment files out of Docker build contexts.
- `Jenkinsfile`: runs the API Jest suite, detects changed service directories, builds/pushes tagged images with Buildx registry cache, creates Kubernetes Secrets from Jenkins Credentials and deploys to EKS.
- `apps/{api,admin,ui,assets}/Dockerfile`: production images, built from the monorepo root context. The Vite admin uses unprivileged Nginx; the Next storefront runs its standalone Node server.
- `apps/recommendation-service/Dockerfile`: production image for the actual FastAPI/Python service in this repository.
- `deploy/nginx/admin.conf`: SPA fallback for the Vite admin.
- `k8s/namespace.yaml`: target namespace.
- `k8s/api.yaml`, `k8s/assets.yaml`, `k8s/recommendation-service.yaml`: each service's ConfigMap, Deployment and Service; API/assets are externally addressable LoadBalancers because the browser clients need their URLs.
- `k8s/admin.yaml` and `k8s/ui.yaml`: frontend Deployments and externally addressable LoadBalancer Services.

The manifests refer to `api-secrets`, `assets-secrets` and `recommendation-secrets`. Jenkins creates/updates these Kubernetes Secret objects from Jenkins Credentials at deploy time. No real credentials or misleading plaintext Secret manifests are committed.

## Local run

From the repository root:

```sh
docker compose up --build
```

Default endpoints: storefront `http://localhost:3000`, admin `http://localhost:8081`, API `http://localhost:8080`, assets `http://localhost:8082`, recommendation `http://localhost:8000`. Inside the Compose network, use the service DNS names (`api:8080`, `assets:8082`, `recommendation-service:8000`, and `postgres:5432`), not `localhost`.

The admin is a static bundle, and the Next storefront builds its browser bundle and standalone server at image-build time, so public API, socket, reCAPTCHA and assets values must be set before building. Set the corresponding `NEXT_PUBLIC_*` and `VITE_*` variables before `docker compose up --build` for a non-default environment. Compose includes development-only local JWT and PostgreSQL defaults; override them for any shared/staging environment. Set the Cloudinary variables to use asset upload functionality. The database starts empty: apply the project's schema/migrations before expecting API operations to work.

## Jenkins prerequisites and parameters

Use a Linux Jenkins agent labeled `linux-docker-aws` with Node.js/npm matching the lockfile (npm 11), AWS CLI, Docker with Buildx, `kubectl`, `envsubst` (from `gettext`), and network access to ECR/EKS. Install the Jenkins Credentials Binding plugin for secret values. The Docker daemon must support the requested `BUILD_PLATFORMS`; use a Buildx builder with QEMU/binfmt registered for cross-architecture builds.

Create a Jenkins Multibranch Pipeline for this repository. Set the pipeline parameters:

- `AWS_ACCOUNT_ID`, `AWS_REGION`, `ECR_REPOSITORY_PREFIX` (default `shopee-clone`), `EKS_CLUSTER_NAME`, and `K8S_NAMESPACE`.
- `BUILD_PLATFORMS` (default `linux/amd64`; use `linux/amd64,linux/arm64` only if the cluster nodes and all dependencies support both).
- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `VITE_PUBLIC_API_URL`, `VITE_PUBLIC_SOCKET_URL`, `VITE_ASSET_URL`, `BUYER_URL`, and `ADMIN_URL`. These are public build/origin configuration, not passwords.
- Set `FORCE_BUILD_ALL=true` when intentionally changing build-time parameters or when deploying a new environment; source-diff detection otherwise builds only apps changed by the commit.

Create Jenkins **Secret text** credentials with these exact IDs; use URLs that point to the production RDS instance:

| Jenkins credential ID | Secret key |
| --- | --- |
| `api-database-url` | `DATABASE_URL` for the Nest API |
| `jwt-access-secret` | `JWT_ACCESS_SECRET` |
| `jwt-refresh-secret` | `JWT_REFRESH_SECRET` |
| `jwt-action-secret` | `JWT_ACTION_SECRET` |
| `assets-cloudinary-cloud-name` | `CLOUDINARY_CLOUD_NAME` |
| `assets-cloudinary-api-key` | `CLOUDINARY_API_KEY` |
| `assets-cloudinary-api-secret` | `CLOUDINARY_API_SECRET` |
| `recommendation-database-url` | `DATABASE_URL` for FastAPI |

Prefer an EC2/ECS-hosted Jenkins agent instance role over long-lived IAM access keys. Grant it only ECR push permissions for the five repositories and permission to describe the target EKS cluster. Add that IAM principal to the cluster's EKS access entries/Kubernetes authorization so it can deploy in the `shopee` namespace. The EKS worker-node role needs ECR pull access. The Jenkinsfile builds/deploys `api`, `admin`, `ui`, `assets`, and `recommendation-service` only from the `main` branch; it skips image builds/deploys if no app or deployment input changed. The `api` and `assets` Node Dockerfiles use Node 22.

## AWS Console setup (manual)

1. **Network**: choose/create a VPC with private subnets for EKS nodes and RDS, and public subnets for internet-facing load balancers. Ensure subnets are tagged for Kubernetes load balancers; configure route tables, NAT, and security groups so nodes can reach ECR, RDS and required external APIs.
2. **ECR**: create private repositories named `${ECR_REPOSITORY_PREFIX}-api`, `-admin`, `-ui`, `-assets`, and `-recommendation-service` in the same region as the cluster. Enable image scanning and a lifecycle policy to expire untagged/old build-cache images.
3. **EKS**: create the cluster IAM role and EKS cluster in the selected VPC/subnets, then create a managed node group with a node IAM role and sufficient capacity. Enable the VPC CNI, CoreDNS and kube-proxy add-ons. From an administrator context, create the namespace once with `export K8S_NAMESPACE=shopee` followed by `envsubst < k8s/namespace.yaml | kubectl apply -f -`. Create EKS access entries for the Jenkins principal with namespace-scoped edit/deploy access; grant node role ECR pull. Pre-creating the namespace avoids giving Jenkins cluster-scoped namespace permissions. The Jenkins agent must have a supported `kubectl` version and be able to reach the EKS API endpoint.
4. **RDS PostgreSQL**: create a PostgreSQL DB/subnet group in private subnets, disable public access, require encrypted storage, and allow inbound 5432 only from the EKS node/pod security group. Create the production schema/migrations and store separate API/recommendation connection strings as Jenkins Secret text credentials (or migrate to AWS Secrets Manager/External Secrets for rotation).
5. **IAM for Jenkins**: if an instance role is not possible, create a dedicated IAM user, enable only programmatic access, and attach least-privilege policies: `ecr:GetAuthorizationToken` plus required ECR upload actions scoped to the five repos, and `eks:DescribeCluster` for the cluster. Store its access key/secret as Jenkins credentials and expose them to the agent's AWS CLI credential chain through a restricted Jenkins credential binding; the pipeline uses the AWS CLI default credential chain. Never put keys in pipeline parameters or the Jenkinsfile. Prefer short-lived role credentials instead.
6. **Public endpoints**: the sample Services use AWS LoadBalancers, which allocate separate public load balancers for API, assets, admin and UI and are not TLS-terminated. For production, install AWS Load Balancer Controller, change Services to `ClusterIP`, and add an ALB Ingress with ACM certificates and DNS records for the configured URLs. Enforce HTTPS and restrict database ingress to the application security group.
7. **Deploy**: run the Jenkins job with the parameters above. Check `kubectl get deployments,services -n shopee` and the Jenkins rollout status. Update the frontend URL build parameters whenever the public API/socket/assets endpoint changes; set `FORCE_BUILD_ALL` to rebuild those baked values.

## Dockerfile review and operational notes

- The old API/assets Dockerfiles assumed an app-root build context, although these projects are npm workspaces. The replacements build from repository root with root `package-lock.json`, run workspace builds, install only the selected app's production dependencies in the runtime image, copy only required runtime output, and run as the non-root Node user. Assets now exposes its actual default port, `8082` (not `8080`).
- The old admin image used `npm ci --force`, which can hide dependency conflicts. It now uses deterministic `npm ci`, builds in the workspace, serves with unprivileged Nginx on 8080, and has SPA route fallback.
- The provided Next Dockerfile expected `apps/ui/out`, but the repository's Next config did not enable static export and the current dynamic route `/[category]` has no `generateStaticParams()`. A real Next production build confirmed static export fails for that route. To preserve dynamic routes and ensure deployable output, this setup enables Next's standalone output and serves it with non-root Node 22; the user-facing frontend is therefore not Nginx/static in this repository state. If all routes later become statically enumerable, switch back to `output: "export"` and Nginx after verifying `next build`.
- Node 20 is replaced with Node 22. BuildKit registry cache, dependency-first Docker layers, multi-stage builds and `.dockerignore` reduce repeat work/image contents. Buildx platform selection is parameterized; multi-architecture builds require compatible native dependencies (notably `sharp`/`bcrypt`) and tested node groups.
- Distroless could reduce runtime surface further, but the Node services include native modules and need runtime/static paths; the non-root Alpine runtime is the simpler maintainable baseline. Keep images patched and scan them in ECR.
- The actual `apps/recommendation-service` is FastAPI/Python (despite the initial Node.js assumption), so its image and Kubernetes deployment use Python, port 8000 and the existing `/health` endpoint.
