# serverless

Lambda Function Definition

Usage:

- index.js file has lambda function which gets invoked by sns source topic 
- Github Actions build gets triggers when the lambda function gets updated and pushed to the github serverless repository
- Github Actions build zips the updated lambda function and places it in S3 bucket for the latest lambda function deployment(lambda function update)
- Lambda function is written in Nodejs with ses to trigger the mails to the recipients