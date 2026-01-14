pipeline {
    agent {
        label 'maven-nodejs-docker'
    }

    environment {
        REGISTRY = '21120414/hsk-etymology'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_CREDENTIALS_ID = '2866c8c9-df5c-4e55-8190-7184500e646f'
        SCM_CREDENTIALS_ID = 'b93e0344-0588-4000-a1f2-5b9ae29383fb'

    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Build') {
            steps {
                container('nodejs') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                container('docker-cli') {
                    sh 'docker build -t $REGISTRY:$IMAGE_TAG -t $REGISTRY:latest .'
                }
            }
        }

        stage('Docker Push') {
            steps {
                container('docker-cli') {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh 'docker push $REGISTRY:$IMAGE_TAG'
                        sh 'docker push $REGISTRY:latest'
                    }
                }
            }
        }

        stage('Update Manifest') {
            steps {
                withCredentials([usernamePassword(credentialsId: SCM_CREDENTIALS_ID, passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                    sh '''
                        git config user.email "haquocbao607@gmail.com"
                        git config user.name "Jenkins CI"
                        sed -i "s|image: 21120414/hsk-etymology:.*|image: $REGISTRY:$IMAGE_TAG|g" k8s/deployment.yaml
                        git add k8s/deployment.yaml
                        git commit -m "Update image to $REGISTRY:$IMAGE_TAG [skip ci]"
                        
                        # Handle remote URL setup for push if using http/https credentials
                        git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/hoangtu47/hsk-etymology.git HEAD:main
                    '''
                }
            }
        }
    }
}
