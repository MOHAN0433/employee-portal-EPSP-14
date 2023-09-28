const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const db = new DynamoDBClient({ region: "ap-south-1" });

const createEmployee = async (event) => {
    const nameRegex = /^[A-Za-z]{3,11}$/;
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const bankDetails= body.bankDetails
    // Check for required fields
    if (!body.bankDetails.BankName || !body.bankDetails.BranchName || !body.bankDetails.BranchAddress || !body.bankDetails.BankAccountNumber) {
      throw new Error('Required fields are missing.');
    }

    //const id = body.postId;
//     const empData = {
//         TableName: process.env.DYNAMODB_TABLE_NAME,
//         Key: marshall({ postId: event.body.postId }),
//       };
//       const { Item } = await db.send(new GetItemCommand(empData));
      
//     if (Item) {
// throw new Error("already exists")
//     }

    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: marshall(
          {
            postId: body.postId,
            bankDetails: {
              BankName: bankDetails.BankName,
              BranchName: bankDetails.BranchName,
              BranchAddress: bankDetails.BranchAddress,
              CustomerNumber: bankDetails.CustomerNumber,
              BankAccountNumber: bankDetails.BankAccountNumber,
              IsSalaryAccount: bankDetails.IsSalaryAccount,
              IsActive: bankDetails.IsActive,
              IsDeleted: bankDetails.IsDeleted,
            },
          },
          { removeUndefinedValues: true }
        ),
      };

    if (!nameRegex.test(bankDetails.BankName)) {
        // Check if mobileNumber is not 10 digits or contains spaces
        statusCode = 400;   
        body = "Invalid username.";
      }
    else{await db.send(new PutItemCommand(params));}
    response.body = JSON.stringify({
      message: 'Successfully created post.',
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to create post.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

module.exports = {
  createEmployee
};
