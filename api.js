const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const db = new DynamoDBClient({ region: "ap-south-1" });

const nameRegex = /^[A-Za-z]{3,32}$/;
const CustomerNumberRegex = /^\d{11}$/;
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
    // if (!body.bankDetails.BankName || !body.bankDetails.BranchName || !body.bankDetails.BranchAddress || !body.bankDetails.BankAccountNumber) {
    //   throw new Error('Required fields are missing.');
    // }

    //const id = body.postId;
    const empData = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ postId: body.postId }),
      };
      const { Item } = await db.send(new GetItemCommand(empData));
      if (Item) {
      const item1 = { item2: Item ? unmarshall(Item) : {} };
      console.log(item1);
      
      if(item1.item2.bankDetails.BankAccountNumber === bankDetails.BankAccountNumber){
      throw new Error("BankAccountNumber already exists");
    }
}
      

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        postId: body.postId,
    bankDetails : {
        BankName: bankDetails.BankName,//give bank object and validate it and set it bankname
        BranchName: bankDetails.BranchName,
        BranchAddress: bankDetails.BranchAddress,
        CustomerNumber: bankDetails.CustomerNumber,
        BankAccountNumber: bankDetails.BankAccountNumber,
        IsSalaryAccount: bankDetails.IsSalaryAccount, //required boolean
        IsActive: bankDetails.IsActive, //required boolean
        IsDeleted: bankDetails.IsDeleted, //required boolean
      }}, { removeUndefinedValues: true }),  //for remove undefined fields
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

const updateEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const bankDetails= body.bankDetails
    const validationError = validation(bankDetails);
    if (validationError) {
      throw new Error(validationError);
    }
    // Check for required fields
    // if (!body.bankDetails.BankName || !body.bankDetails.BranchName || !body.bankDetails.BranchAddress || !body.bankDetails.BankAccountNumber) {
    //   throw new Error('Required fields are missing.');
    // }

    //const id = body.postId;
    const empData = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ postId: event.pathParameters.postId }),
      };
      const { Item } = await db.send(new GetItemCommand(empData));
      if (Item) {
      const item1 = { item2: Item ? unmarshall(Item) : () => {throw new Error("Employee Id not fount")} };
      console.log(item1);
      
    //   if(item1.item2.bankDetails.BankAccountNumber === bankDetails.BankAccountNumber){
    //   throw new Error("BankAccountNumber already exists");
    // }
}

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        postId: body.postId,
    bankDetails : {
        BankName: bankDetails.BankName,//give bank object and validate it and set it bankname
        BranchName: bankDetails.BranchName,
        BranchAddress: bankDetails.BranchAddress,
        CustomerNumber: bankDetails.CustomerNumber,
        BankAccountNumber: bankDetails.BankAccountNumber,
        IsSalaryAccount: bankDetails.IsSalaryAccount, //required boolean
        IsActive: bankDetails.IsActive, //required boolean
        IsDeleted: bankDetails.IsDeleted, //required boolean
      }}, { removeUndefinedValues: true }),  //for remove undefined fields
    };

    

    await db.send(new UpdateItemCommand(params));
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
  createEmployee,
  updateEmployee
};