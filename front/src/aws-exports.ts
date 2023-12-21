
import { ResourcesConfig } from '@aws-amplify/core';

const awsConfig: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolClientId: 'mrts1emso1grqm6am788slmma',
            userPoolId: 'eu-central-1_Ph9xjHmoj',
        }
    }
}

export default awsConfig