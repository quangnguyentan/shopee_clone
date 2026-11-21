pipeline {
  agent { label 'linux-docker-aws' }

  options {
    timestamps()
    disableConcurrentBuilds()
    skipDefaultCheckout(true)
  }

  parameters {
    string(name: 'AWS_ACCOUNT_ID', defaultValue: '', description: '12-digit AWS account ID')
    string(name: 'AWS_REGION', defaultValue: 'ap-southeast-1', description: 'AWS region containing ECR and EKS')
    string(name: 'ECR_REPOSITORY_PREFIX', defaultValue: 'shopee-clone', description: 'Prefix for per-service ECR repositories')
    string(name: 'EKS_CLUSTER_NAME', defaultValue: '', description: 'Target EKS cluster')
    string(name: 'K8S_NAMESPACE', defaultValue: 'shopee', description: 'Kubernetes namespace')
    booleanParam(name: 'FORCE_BUILD_ALL', defaultValue: false, description: 'Rebuild and deploy every service (for changed build-time configuration)')
    string(name: 'BUYER_URL', defaultValue: 'https://shopeeclone.com', description: 'Allowed storefront origin')
    string(name: 'ADMIN_URL', defaultValue: 'https://admin.shopeeclone.com', description: 'Allowed admin origin')
    string(name: 'BUILD_PLATFORMS', defaultValue: 'linux/amd64', description: 'Docker Buildx target platforms')
    string(name: 'NEXT_PUBLIC_API_URL', defaultValue: 'https://api.shopeeclone.com', description: 'Public API URL baked into the storefront')
    string(name: 'NEXT_PUBLIC_SOCKET_URL', defaultValue: 'https://api.shopeeclone.com', description: 'Public socket URL baked into the storefront')
    string(name: 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY', defaultValue: '', description: 'Public reCAPTCHA site key')
    string(name: 'VITE_PUBLIC_API_URL', defaultValue: 'https://api.shopeeclone.com', description: 'Public API URL baked into the admin')
    string(name: 'VITE_PUBLIC_SOCKET_URL', defaultValue: 'https://api.shopeeclone.com', description: 'Public socket URL baked into the admin')
    string(name: 'VITE_ASSET_URL', defaultValue: 'https://assets.shopeeclone.com', description: 'Public assets URL baked into the admin')
  }

  environment {
    ECR_REGISTRY = "${params.AWS_ACCOUNT_ID}.dkr.ecr.${params.AWS_REGION}.amazonaws.com"
    IMAGE_TAG = ''
    SERVICES_TO_BUILD = ''
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.IMAGE_TAG = env.GIT_COMMIT.take(12)
        }
      }
    }

    stage('Install dependencies and detect affected apps') {
      steps {
        sh '''
          set -eu
          npm ci
        '''
        script {
          if (params.FORCE_BUILD_ALL) {
            env.SERVICES_TO_BUILD = 'api admin ui assets recommendation-service'
          } else {
            env.SERVICES_TO_BUILD = sh(
              returnStdout: true,
              script: '''
                set -eu
                if [ -n "${GIT_PREVIOUS_SUCCESSFUL_COMMIT:-}" ] && git cat-file -e "${GIT_PREVIOUS_SUCCESSFUL_COMMIT}^{commit}" 2>/dev/null; then
                  base="$GIT_PREVIOUS_SUCCESSFUL_COMMIT"
                elif [ -n "${CHANGE_TARGET:-}" ]; then
                  git fetch --no-tags origin "refs/heads/${CHANGE_TARGET}:refs/remotes/origin/${CHANGE_TARGET}"
                  base="origin/${CHANGE_TARGET}"
                elif git rev-parse --verify HEAD^ >/dev/null 2>&1; then
                  base="HEAD^"
                else
                  base=""
                fi
                if [ -z "$base" ]; then
                  printf '%s\\n' 'api admin ui assets recommendation-service'
                  exit 0
                fi
                changed="$(git diff --name-only "$base"...HEAD)"
                if printf '%s\\n' "$changed" | grep -Eq '^(package\\.json|package-lock\\.json|turbo\\.json|Jenkinsfile|\\.dockerignore|k8s/|deploy/nginx/)'; then
                  printf '%s\\n' 'api admin ui assets recommendation-service'
                  exit 0
                fi
                turbo_services="$(npx turbo run build "--filter=...[$base]" --dry=json |
                  node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s);const m={backend:"api",admin:"admin",client:"ui",assets:"assets"};console.log([...new Set(j.tasks.map(t=>m[t.package]).filter(Boolean))].join(" "))})')"
                services=" $turbo_services "
                for service in api admin ui assets recommendation-service; do
                  case "$service" in
                    recommendation-service) path='apps/recommendation-service/' ;;
                    *) path="apps/$service/" ;;
                  esac
                  if printf '%s\\n' "$changed" | grep -q "^${path}" && ! printf '%s\\n' "$services" | grep -q " $service "; then
                    services="$services $service "
                  fi
                done
                printf '%s\\n' "$services" | xargs
              '''
            ).trim()
          }
        }
      }
    }

    stage('Test') {
      steps {
        sh '''
          set -eu
          npm test --workspace=backend -- --runInBand
        '''
      }
    }

    stage('Authenticate and initialize Buildx') {
      when {
        allOf {
          branch 'main'
          expression { return env.SERVICES_TO_BUILD?.trim() }
        }
      }
      steps {
        sh '''
          set -eu
          test -n "$AWS_ACCOUNT_ID"
          test -n "$EKS_CLUSTER_NAME"
          test -n "$NEXT_PUBLIC_RECAPTCHA_SITE_KEY"
          aws sts get-caller-identity
          aws ecr get-login-password --region "$AWS_REGION" |
            docker login --username AWS --password-stdin "$ECR_REGISTRY"
          if ! docker buildx inspect shopee-ci >/dev/null 2>&1; then
            docker buildx create --name shopee-ci --driver docker-container
          fi
          docker buildx use shopee-ci
          docker buildx inspect --bootstrap
        '''
      }
    }

    stage('Build and push changed images') {
      when {
        allOf {
          branch 'main'
          expression { return env.SERVICES_TO_BUILD?.trim() }
        }
      }
      steps {
        sh '''
          set -eu
          for service in $SERVICES_TO_BUILD; do
            case "$service" in
              recommendation-service) dockerfile="apps/recommendation-service/Dockerfile" ;;
              *) dockerfile="apps/$service/Dockerfile" ;;
            esac
            image="$ECR_REGISTRY/$ECR_REPOSITORY_PREFIX-$service"
            case "$service" in
              admin)
                docker buildx build \
                  --platform "$BUILD_PLATFORMS" \
                  --cache-from "type=registry,ref=$image:buildcache" \
                  --cache-to "type=registry,ref=$image:buildcache,mode=max" \
                  --build-arg "VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL" \
                  --build-arg "VITE_PUBLIC_SOCKET_URL=$VITE_PUBLIC_SOCKET_URL" \
                  --build-arg "VITE_ASSET_URL=$VITE_ASSET_URL" \
                  --build-arg VITE_NODE_ENV=production \
                  --push --tag "$image:$IMAGE_TAG" --file "$dockerfile" .
                ;;
              ui)
                docker buildx build \
                  --platform "$BUILD_PLATFORMS" \
                  --cache-from "type=registry,ref=$image:buildcache" \
                  --cache-to "type=registry,ref=$image:buildcache,mode=max" \
                  --build-arg "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" \
                  --build-arg "NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL" \
                  --build-arg "NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY" \
                  --push --tag "$image:$IMAGE_TAG" --file "$dockerfile" .
                ;;
              *)
                docker buildx build \
                  --platform "$BUILD_PLATFORMS" \
                  --cache-from "type=registry,ref=$image:buildcache" \
                  --cache-to "type=registry,ref=$image:buildcache,mode=max" \
                  --push --tag "$image:$IMAGE_TAG" --file "$dockerfile" .
                ;;
            esac
          done
        '''
      }
    }

    stage('Deploy to EKS') {
      when {
        allOf {
          branch 'main'
          expression { return env.SERVICES_TO_BUILD?.trim() }
        }
      }
      steps {
        sh '''
          set -eu
          aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER_NAME"
        '''
        withCredentials([
          string(credentialsId: 'api-database-url', variable: 'API_DATABASE_URL'),
          string(credentialsId: 'jwt-access-secret', variable: 'JWT_ACCESS_SECRET'),
          string(credentialsId: 'jwt-refresh-secret', variable: 'JWT_REFRESH_SECRET'),
          string(credentialsId: 'jwt-action-secret', variable: 'JWT_ACTION_SECRET'),
          string(credentialsId: 'assets-cloudinary-cloud-name', variable: 'CLOUDINARY_CLOUD_NAME'),
          string(credentialsId: 'assets-cloudinary-api-key', variable: 'CLOUDINARY_API_KEY'),
          string(credentialsId: 'assets-cloudinary-api-secret', variable: 'CLOUDINARY_API_SECRET'),
          string(credentialsId: 'recommendation-database-url', variable: 'RECOMMENDATION_DATABASE_URL')
        ]) {
          sh '''
            set +x
            set -eu
            kubectl create secret generic api-secrets --namespace "$K8S_NAMESPACE" \
              --from-literal=DATABASE_URL="$API_DATABASE_URL" \
              --from-literal=JWT_ACCESS_SECRET="$JWT_ACCESS_SECRET" \
              --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
              --from-literal=JWT_ACTION_SECRET="$JWT_ACTION_SECRET" \
              --dry-run=client -o yaml | kubectl apply -f -
            kubectl create secret generic assets-secrets --namespace "$K8S_NAMESPACE" \
              --from-literal=CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" \
              --from-literal=CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY" \
              --from-literal=CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET" \
              --dry-run=client -o yaml | kubectl apply -f -
            kubectl create secret generic recommendation-secrets --namespace "$K8S_NAMESPACE" \
              --from-literal=DATABASE_URL="$RECOMMENDATION_DATABASE_URL" \
              --dry-run=client -o yaml | kubectl apply -f -
          '''
        }
        sh '''
          set -eu
          export IMAGE_TAG ECR_REGISTRY ECR_REPOSITORY_PREFIX K8S_NAMESPACE BUYER_URL ADMIN_URL
          for service in $SERVICES_TO_BUILD; do
            case "$service" in
              recommendation-service) manifest="k8s/recommendation-service.yaml" ;;
              *) manifest="k8s/$service.yaml" ;;
            esac
            envsubst < "$manifest" | kubectl apply -f -
            kubectl rollout status "deployment/$service" --namespace "$K8S_NAMESPACE" --timeout=5m
          done
        '''
      }
    }
  }
}
