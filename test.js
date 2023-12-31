const { expect } = require('chai');
const { BankDeatilsHandler } = require('./api'); // Import both createEmployee and updateEmployee
const {
  DynamoDBClient,
} = require('@aws-sdk/client-dynamodb');


// Mock DynamoDBClient to avoid making actual AWS calls
const mockClient = {
  send: () => ({}),
};

// Mock employee data for createEmployee
const createEmployeeBankDetails = {
  empId: "25",
  bankDetails: {
    BankName: "kanara",
    BranchName: "hydrabad",
    BranchAddress: "bangalore",
    CustomerNumber: "12345678912",
    BankAccountNumber: "55566444412",
    IsSalaryAccount: "yes",
    IsActive: "yes",
    IsDeleted: "false"
  }
};

// Mock employee data for updateEmployee
const updateEmployeeBankDetails = {
  bankDetails: {
    BankName: "kanara",
    BranchName: "bangalore",
    BranchAddress: "bangalore",
    CustomerNumber: "12345678912",
    BankAccountNumber: "55566444412",
    IsSalaryAccount: "yes",
    IsActive: "yes",
    IsDeleted: "false"
  }
};

// Successfully create an employee
describe('createEmployeeBankDetails unit tests', () => {
  let originalDynamoDBClient;

  before(() => {
    originalDynamoDBClient = DynamoDBClient;
    DynamoDBClient.prototype.send = () => mockClient.send();
  });

  after(() => {
    DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
  });

  it('successfully create BankDetails', async () => {
    // Mock event object with employee data
    let event = {
      body: JSON.stringify(createEmployeeBankDetails),
      resource: `/employee/bankDetails`, // Specify the resource
    };

    const response = await BankDeatilsHandler(event);
    expect(response.statusCode).to.equal(200);
    const responseBody = JSON.parse(response.body);
    console.log(responseBody.message);
    expect(responseBody.message).to.equal('Successfully created BankDetails!');
  });

  it('fails to create an employee with missing data', async () => {
    // Mock event object with missing data
    let event = {
      body: JSON.stringify({
        bankDetails : {
          // Invalid data that should fail validation
          //BankName: 'AB', // Too short
        }
      }),
      resource: `/employee/bankDetails`, // Specify the resource
    };

    const response = await BankDeatilsHandler(event);
    expect(response.statusCode).to.equal(400); // Expecting a 400 Bad Request for missing data
  });

  it('fails to create an employee with invalid data', async () => {
    // Mock event object with invalid data
    let event = {
      body: JSON.stringify({
        bankDetails : {
          // Invalid data that should fail validation
          BankName: 'AB', // Too short
        }
      }),
      // Specify the resource
      resource: `/employee/bankDetails`,
    };

    const response = await BankDeatilsHandler(event);
    expect(response.statusCode).to.equal(400); // Expecting a 400 Bad Request for invalid data
    const responseBody = JSON.parse(response.body);
    expect(responseBody.errorMsg).to.equal('BankName should be minimum 3 characters!');
  });
});

// Successfully update an employee
describe('updateEmployee unit tests', () => {
  let originalDynamoDBClient;

  before(() => {
    originalDynamoDBClient = DynamoDBClient;
    DynamoDBClient.prototype.send = () => mockClient.send();
  });

  after(() => {
    DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
  });

  it('successfully update an employee', async () => {
    // Mock event object with the employee ID and updated data
    let event = {
      pathParameters: {
        empId: '2', // Assuming this empId exists
      },
      body: JSON.stringify(updateEmployeeBankDetails),
      resource: `/employee/bankDetails/{empId}`, // Specify the resource with empId
    };

    const response = await BankDeatilsHandler(event);
    expect(response.statusCode).to.equal(200);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal('Successfully updated BankDetails.'); // Update the message if necessary
  });

  it('fails to update an employee with invalid data', async () => {
    // Mock event object with invalid data
    let event = {
      pathParameters: {
        empId: '25', // Assuming this empId exists
      },
      body: JSON.stringify({
        // Invalid data that should fail validation
        bankDetails : {
          BankName: 'a', // Too short
        }
      }),
      resource: `/employee/bankDetails/{empId}`, // Specify the resource with empId
    };

    const response = await BankDeatilsHandler(event);
    expect(response.statusCode).to.equal(400); // Expecting a 400 Bad Request for invalid data
    const responseBody = JSON.parse(response.body);
    expect(responseBody.errorMsg).to.equal('BankName should be minimum 3 characters!');
  });
});
