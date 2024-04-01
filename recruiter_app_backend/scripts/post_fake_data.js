const axios = require("axios");
const {faker} = require("@faker-js/faker");

const url = "http://127.0.0.1:9000/researchers"; //! change this

function createRandomVolunteer() {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    date_of_birth: faker.date.birthdate(),
    gender: faker.person.sex(),
    tags: [],
    research_involved: [],
  };
}

function createRandomResearch() {
  return {
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    tags: [],
    researchers: [],
  };
}

function createRandomResearcher() {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    date_of_birth: faker.date.birthdate(),
    gender: faker.person.sex(),
  };
}

function postFakeData(times) {
  for (let i = 0; i < times; i++) {
    const fakeData = createRandomResearcher(); //! change this
    const options = {
      method: "POST",
      url: url,
      headers: {"Content-Type": "application/json"},
      data: fakeData,
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }
}

postFakeData(2); //! change this
