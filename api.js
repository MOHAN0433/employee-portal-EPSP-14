const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const db = new DynamoDBClient({ region: "ap-south-1" });

const nameRegex = /^[A-Za-z]{3,32}$/;
const CustomerNumberRegex = /^\d{11,12}$/;
const BankAccountNumber = /^\d{11,16}$/;

const validation = (bankDetails) => {
  if (!nameRegex.test(bankDetails.BankName)) {
    return "BankName should be minimum 3 characters!";
  }
  if (!nameRegex.test(bankDetails.BranchName)) {
    return "BranchName should be minimum 3 characters!";
  }
  if (!nameRegex.test(bankDetails.BranchAddress)) {
    return "BranchAddress should be minimum 3 characters!";
  }
  if (!CustomerNumberRegex.test(bankDetails.CustomerNumber)) {
    return "CustomerNumber should be minimum 11 characters!";
  }
  if (!BankAccountNumber.test(bankDetails.BankAccountNumber)) {
    return "BankAccountNumber should be minimum 11 digits!";
  }
  return null; // Validation passed
}

const createEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const bankDetails= body.bankDetails
    const validationError = validation(bankDetails);
    if (validationError) {
      throw new Error(validationError);
    }
  // Check for required fields
    if (!body.bankDetails.BankName || !body.bankDetails.BranchName || !body.bankDetails.BranchAddress || !body.bankDetails.BankAccountNumber) {
      throw new Error('Required fields are missing.');
    }

    //const id = body.postId;
    const employeeData = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ postId: body.postId }),
      };
      const { Item } = await db.send(new GetItemCommand(employeeData));
      if (Item) {
      const item1 = { item2: Item ? unmarshall(Item) : {} };
      console.log(item1);
      
      //if(item1.item2.bankDetails.BankAccountNumber === bankDetails.BankAccountNumber || item1.item2.bankDetails.BankName === bankDetails.BankName){
      if (item1.item2.bankDetails) {
      throw new Error("BankDetails already exists!");
    }
}
      

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        postId: body.postId,
    bankDetails : {
        BankName: bankDetails.BankName,
        BranchName: bankDetails.BranchName,
        BranchAddress: bankDetails.BranchAddress,
        CustomerNumber: bankDetails.CustomerNumber,
        BankAccountNumber: bankDetails.BankAccountNumber,
        IsSalaryAccount: bankDetails.IsSalaryAccount,
        IsActive: bankDetails.IsActive,
        IsDeleted: bankDetails.IsDeleted,
      }}, { removeUndefinedValues: true }),
    };

    

    await db.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully created post.',
    });
  } catch (e) {
    console.error(e);
    response.body = JSON.stringify({
      message: 'Failed to create post.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

const updateEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const objKeys = Object.keys(body);
    //const validationError = validation(body);
    
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.postId }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(', ')}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
    };
    const updateResult = await db.send(new UpdateItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully updated post.',
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.body = JSON.stringify({
      message: 'Failed to update post.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

module.exports = {
  createEmployee,
  updateEmployee
};