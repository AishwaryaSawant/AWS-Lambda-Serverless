var aws = require("aws-sdk");
var ses = new aws.SES();
// const { v4: uuidv4 } = require("uuid");
const region = "us-east-1";
const documentClient = new aws.DynamoDB.DocumentClient({ region: region });

exports.handler = function (event, context, callback) {
  var snsmessage = event.Records[0].Sns.Message;
  var jsonmsg = JSON.parse(snsmessage);

  const senderemail = jsonmsg.email;
  const msg = jsonmsg.msg;

  const subject = jsonmsg.subject;
  const answerId = jsonmsg.answerId;
  const answerText = jsonmsg.answerText;
  const action = jsonmsg.action;

  const questionId = jsonmsg.questionId;
  const userId = jsonmsg.userId;

  console.log(questionId)
  console.log(userId)
  // const action = jsonmsg.
  console.log(senderemail)
  // const questionId = jsonmsg.questionId;
  // const answerId = jsonmsg.answerId;
  // const answerText = jsonmsg.answerText;
  // const answerlink = jsonmsg.answerlink;
  // const questionlink = jsonmsg.questionlink;
  // const action = jsonmsg.action;
  

  const DBParams = {
    TableName: "csye6225",
    Item: {
      answerid: questionId+userId,//answerId,
      //token: uuidv4(),
      AnswerText: answerText
    },
  };

  const DBParams1 = {
    TableName: "csye6225",
    Key: {
      answerid: questionId+userId,//answerId,
      //token: uuidv4(),
      AnswerText: answerText
    },
  };

  const emailParams = {
    Source: "qna@prods.aishwaryas.me",
    Destination: {ToAddresses: [senderemail]},
    Message: {
        Body: {
            Html: {
              Data: ""+[msg] }
          },
          Subject: { Data: ""+[subject] },
    },
  };

  // const DBParams = {
  //   TableName: "csye6225",
  //   Item: {
  //     id: senderemail,
  //     token: uuidv4(),
  //     questionId: questionId,
  //     answerId: answerId,
  //     answerText: answerText,
  //     questionlink: questionlink,
  //     answerlink: answerlink,
  //     TimeToLive: expirationTime
  //   },
  // };

  // const emailParams1 = {
  //   Source: "qna@prods.aishwaryas.me",
  //   Destination: {ToAddresses: [senderemail]},
  //   Message: {
  //       Body: {
  //           Html: {
  //             Data:
  //               "\n Dear User, Question: "+questionId+" , has been answered. \n The answer details are: AnswerId: "+answerId+" ,Answer text: "+answerText+
  //               "\n To view answer, Click on the link: "+answerlink+"\n To view question, Click on the link: "+questionlink}
  //         },
  //         Subject: { Data: "Question Answered" },
  //   },
  // };

  // const emailParams2 = {
  //   Source: "qna@prods.aishwaryas.me",
  //   Destination: {ToAddresses: [senderemail]},
  //   Message: {
  //       Body: {
  //           Html: {
  //             Data:
  //               "\n Dear User, Answer to the Question: "+questionId+" , has been updated. \n The answer details are: AnswerId: "+answerId+" ,Answer text: "+answerText+
  //               "\n To view answer, Click on the link: "+answerlink+"\n To view question, Click on the link: "+questionlink}
  //         },
  //         Subject: { Data: "Answer Updated" },
  //   },
  // };

  // const emailParams3 = {
  //   Source: "qna@prods.aishwaryas.me",
  //   Destination: {ToAddresses: [senderemail]},
  //   Message: {
  //       Body: {
  //           Html: {
  //             Data:
  //               "\n Dear User, Answer to a Question: "+questionId+" , has been deleted. \n The answer details of deleted answer are: AnswerId: "+answerId+
  //               " ,Answer text: "+answerText+"\n To view question, Click on the link: "+questionlink}
  //         },
  //         Subject: { Data: "Answer Deleted" },
  //   },
  // };

  // const emailParams = emailParams3;

  // if(action==="Answered"){
  //   emailParams = emailParams1;
  // }else if(action==="Updated"){
  //   emailParams = emailParams2;
  // }

  var queryparams = {
    TableName: "csye6225",
    Key: {
      answerid: questionId+userId
      //answerId
    },
  };

  documentClient.get(queryparams, function (err, data) {
    if (err) {
        console.log("Error while reading the data from DynamoDB table");
        console.log(err);
    } else {
      if (data.Item) {
        if (data.Item.AnswerText === answerText && action !== "Deleted") {
          console.log("email already sent");
        } else {
          ses.sendEmail(emailParams, function (err, data) {
            callback(null, { err: err, data: data });
            if (err) {
              console.log(err);
              console.log("Error while sending the email through SES");
            } else {
              console.log(data);
              console.log("Email sent successfully to "+senderemail);

              if(action==="Deleted"){
              documentClient.delete(DBParams1, function (err, data) {
                if (err) {
                    console.log(err);
                    console.log("Error while deleting the token from dynamoDB table");
                }
                else {
                    console.log(data);
                    console.log("Token Deleted successfully from dynamoDB table");
                }
              });
              
            }else{
              documentClient.put(DBParams, function (err, data) {
                if (err) {
                    console.log(err);
                    console.log("Error while storing the token in dynamoDB table");
                }
                else {
                    console.log(data);
                    console.log("Token Successfully stored in dynamoDB table");
                }
              });

            }

            }
          });
        }
      } else {


        ses.sendEmail(emailParams, function (err, data) {
          callback(null, { err: err, data: data });
          if (err) {
            console.log(err);
            console.log("Error while sending the email through SES");
          } else {
            console.log(data);
            console.log("Email sent successfully to "+senderemail);
            if(action==="Deleted"){
            documentClient.put(DBParams1, function (err, data) {
              if (err) {
                  console.log(err);
                  console.log("Error while deleting the token from dynamoDB table");
                }
              else {
                  console.log(data);
                  console.log("Token deleted successfully from dynamoDB table");
                }
            });
          }else{
            documentClient.put(DBParams, function (err, data) {
              if (err) {
                  console.log(err);
                  console.log("Error while storing the token in dynamoDB table");
                }
              else {
                  console.log(data);
                  console.log("Token Successfully stored in dynamoDB table");
                }
            });
          }
          }
        });
     }
    }
 });


};
