const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const db = new DynamoDBClient({ region: "ap-south-1" });

const createEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);

    // Check for required fields
    if (!body.BankName || !body.BranchName || !body.BranchAddress || !body.BankAccountNumber) {
      throw new Error('Required fields are missing.');
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        postId: body.postId,
        bankDetails: body.bankDetails,
        BankName: body.bankDetails.BankName,//give bank object and validate it and set it bankname
        BranchName: body.bankDetails.BranchName,
        BranchAddress: body.bankDetails.BranchAddress,
        CustomerNumber: body.bankDetails.CustomerNumber,
        BankAccountNumber: body.bankDetails.BankAccountNumber,
        IsSalaryAccount: body.bankDetails.IsSalaryAccount, //required boolean
        IsActive: body.bankDetails.IsActive, //required boolean
        IsDeleted: body.bankDetails.IsDeleted, //required boolean
      }, { removeUndefinedValues: true }),  //for remove undefined fields
    };

    await db.send(new PutItemCommand(params));
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
