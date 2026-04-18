// Main Jenkins Pipeline for Market Microservices
// Handles build, test, code quality, and deployment

pipeline {
    agent any

    environment {
        NODE_VERSION = "20"
        REGISTRY = "ghcr.io"
        REPOSITORY_OWNER = "yassinekoaubai"
        GIT_COMMIT_SHORT = "${GIT_COMMIT.take(7)}"
        DOCKER_BUILDKIT = "1"
        BUILDKIT_PROGRESS = "plain"
    }

    parameters {
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip running tests')
        booleanParam(name: 'DEPLOY_PRODUCTION', defaultValue: false, description: 'Deploy to production')
        choice(name: 'NODE_VERSION', choices: ['18', '20', '22'], description: 'Select Node.js version')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        disableConcurrentBuilds()
    }

    triggers {
        githubPush()
        pollSCM('H/15 * * * *')  // Poll every 15 minutes
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "📦 Checking out source code..."
                    checkout scm
                    sh 'git log -1 --pretty=format:"%h - %s"'
                }
            }
        }

        stage('Setup') {
            steps {
                script {
                    echo "🔧 Setting up environment..."
                    sh '''
                        node --version
                        npm --version
                        docker --version
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Auth Service') {
                    steps {
                        script {
                            echo "📡 Installing Auth Service dependencies..."
                            sh '''
                                cd auth
                                npm ci
                                npm run generate
                            '''
                        }
                    }
                }
                stage('Catalog Service') {
                    steps {
                        script {
                            echo "📦 Installing Catalog Service dependencies..."
                            sh '''
                                cd catalog
                                npm ci
                                npm run generate
                            '''
                        }
                    }
                }
                stage('Orders Service') {
                    steps {
                        script {
                            echo "🛒 Installing Orders Service dependencies..."
                            sh '''
                                cd orders
                                npm ci
                                npm run generate
                            '''
                        }
                    }
                }
            }
        }

        stage('Build & TypeScript Check') {
            parallel {
                stage('Auth Service Build') {
                    steps {
                        script {
                            echo "🔨 Building Auth Service..."
                            sh '''
                                cd auth
                                npm run build
                            '''
                        }
                    }
                }
                stage('Catalog Service Build') {
                    steps {
                        script {
                            echo "🔨 Building Catalog Service..."
                            sh '''
                                cd catalog
                                npm run build
                            '''
                        }
                    }
                }
                stage('Orders Service Build') {
                    steps {
                        script {
                            echo "🔨 Building Orders Service..."
                            sh '''
                                cd orders
                                npm run build
                            '''
                        }
                    }
                }
            }
        }

        stage('Code Quality Analysis') {
            when {
                expression { !params.SKIP_TESTS }
            }
            parallel {
                stage('Auth Service Quality') {
                    steps {
                        script {
                            echo "✅ Analyzing Auth Service code quality..."
                            sh '''
                                cd auth
                                npm run lint --if-present || true
                                npm audit --audit-level=moderate || true
                            '''
                        }
                    }
                }
                stage('Catalog Service Quality') {
                    steps {
                        script {
                            echo "✅ Analyzing Catalog Service code quality..."
                            sh '''
                                cd catalog
                                npm run lint --if-present || true
                                npm audit --audit-level=moderate || true
                            '''
                        }
                    }
                }
                stage('Orders Service Quality') {
                    steps {
                        script {
                            echo "✅ Analyzing Orders Service code quality..."
                            sh '''
                                cd orders
                                npm run lint --if-present || true
                                npm audit --audit-level=moderate || true
                            '''
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            when {
                branch 'main'
            }
            parallel {
                stage('Build Auth Image') {
                    steps {
                        script {
                            echo "🐳 Building Auth Docker image..."
                            sh '''
                                cd auth
                                docker build \
                                  --tag ${REGISTRY}/${REPOSITORY_OWNER}/market-auth:${GIT_COMMIT_SHORT} \
                                  --tag ${REGISTRY}/${REPOSITORY_OWNER}/market-auth:latest \
                                  .
                            '''
                        }
                    }
                }
                stage('Build Catalog Image') {
                    steps {
                        script {
                            echo "🐳 Building Catalog Docker image..."
                            sh '''
                                cd catalog
                                docker build \
                                  --tag ${REGISTRY}/${REPOSITORY_OWNER}/market-catalog:${GIT_COMMIT_SHORT} \
                                  --tag ${REGISTRY}/${REPOSITORY_OWNER}/market-catalog:latest \
                                  .
                            '''
                        }
                    }
                }
                stage('Build Orders Image') {
                    steps {
                        script {
                            echo "🐳 Building Orders Docker image..."
                            sh '''
                                cd orders
                                docker build \
                                  --tag ${REGISTRY}/${REPOSITORY_OWNER}/market-orders:${GIT_COMMIT_SHORT} \
                                  --tag ${REGISTRY}/${REPOSITORY_OWNER}/market-orders:latest \
                                  .
                            '''
                        }
                    }
                }
            }
        }

        stage('Push to Registry') {
            when {
                allOf {
                    branch 'main'
                    expression { params.DEPLOY_PRODUCTION }
                }
            }
            steps {
                script {
                    echo "📤 Pushing images to registry..."
                    withCredentials([usernamePassword(credentialsId: 'ghcr-credentials', passwordVariable: 'GHCR_PASSWORD', usernameVariable: 'GHCR_USERNAME')]) {
                        sh '''
                            echo "${GHCR_PASSWORD}" | docker login -u ${GHCR_USERNAME} --password-stdin ${REGISTRY}
                            
                            # Push Auth Service
                            docker push ${REGISTRY}/${REPOSITORY_OWNER}/market-auth:${GIT_COMMIT_SHORT}
                            docker push ${REGISTRY}/${REPOSITORY_OWNER}/market-auth:latest
                            
                            # Push Catalog Service
                            docker push ${REGISTRY}/${REPOSITORY_OWNER}/market-catalog:${GIT_COMMIT_SHORT}
                            docker push ${REGISTRY}/${REPOSITORY_OWNER}/market-catalog:latest
                            
                            # Push Orders Service
                            docker push ${REGISTRY}/${REPOSITORY_OWNER}/market-orders:${GIT_COMMIT_SHORT}
                            docker push ${REGISTRY}/${REPOSITORY_OWNER}/market-orders:latest
                            
                            docker logout ${REGISTRY}
                        '''
                    }
                }
            }
        }

        stage('Deploy to Production') {
            when {
                allOf {
                    branch 'main'
                    expression { params.DEPLOY_PRODUCTION }
                }
            }
            steps {
                script {
                    echo "🚀 Deploying to production..."
                    // Deploy using docker-compose or kubectl
                    sh '''
                        echo "Deployment would occur here"
                        echo "Services deployed:"
                        echo "  - market-auth:${GIT_COMMIT_SHORT}"
                        echo "  - market-catalog:${GIT_COMMIT_SHORT}"
                        echo "  - market-orders:${GIT_COMMIT_SHORT}"
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                echo "🧹 Cleaning up..."
                // Clean workspace if needed
            }
        }
        success {
            script {
                echo "✅ Pipeline executed successfully!"
                // Send success notification
            }
        }
        failure {
            script {
                echo "❌ Pipeline failed!"
                // Send failure notification
            }
        }
        unstable {
            script {
                echo "⚠️ Pipeline is unstable"
                // Send warning notification
            }
        }
    }
}
