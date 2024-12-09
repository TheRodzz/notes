pipeline {
    environment {
        backend = 'backend' // Specify your backend Docker image name/tag
        frontend = 'frontend' // Specify your frontend Docker image name/tag
        ATLAS_URI = 'mongodb+srv://testuser:testuser123@notesapp.rbmfola.mongodb.net/?retryWrites=true&w=majority&appName=notesapp'
        ATLAS_DB_NAME = 'notesapp'
        env='deploy'
        docker_image = ''
    }
    
    agent any

    stages {
        stage('Stage 1: Git Clone') {
            steps {
                echo 'Cloning the Git repository'
                git branch: 'main', url: 'https://github.com/TheRodzz/notes.git'
            }
        }
        
        stage('Stage 3: Build backend Docker Image') {
            steps {
                echo 'Building backend Docker image'
                dir('backend')
                {
                    sh "docker build -t vidhuarora/${backend} ."
                }
            }
        }

        stage('Stage 4: Build frontend Docker image') {
            steps {
                echo 'Building frontend Docker image'
                dir('frontend/notes') {
                    echo 'Changing to frontend directory'
                    sh "docker build -t vidhuarora/${frontend} ."
                }
            }
        }

        stage('Stage 5: Push backend Docker image to DockerHub') {
            steps {
                echo 'Pushing backend Docker image to DockerHub'
                script {
                    docker.withRegistry('', 'dockerhubcred') {
                        sh "docker push vidhuarora/${backend}"
                    }
                }
            }
        }
        
        stage('Stage 6: Push frontend Docker image to DockerHub') {
            steps {
                echo 'Pushing frontend Docker image to DockerHub'
                script {
                    docker.withRegistry('', 'dockerhubcred') {
                        sh "docker push vidhuarora/${frontend}"
                    }
                }
            }
        }

        stage('Stage 7: Clean docker images') {
            steps {
                script {
                    sh 'docker container prune -f'
                    sh 'docker image prune -f'
                }
            }
        }

        stage('Stage 8: Ansible Deployment') {
            steps {
                ansiblePlaybook(
                    becomeUser: null,
                    colorized: true,
                    credentialsId: 'localhost',
                    disableHostKeyChecking: true,
                    installation: 'Ansible',
                    inventory: 'Deployment/inventory',
                    playbook: 'Deployment/deploy.yml',
                    sudoUser: null
                )
            }
        }
    }
}