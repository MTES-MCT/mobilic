import { gql } from "graphql-tag";

export const CHANGE_EMAIL_MUTATION = gql`
  mutation changeEmail($email: Email!) {
    account {
      changeEmail(email: $email) {
        email
        hasConfirmedEmail
        hasActivatedEmail
      }
    }
  }
`;
export const CHANGE_NAME_MUTATION = gql`
  mutation changeName(
    $userId: Int!
    $newFirstName: String!
    $newLastName: String!
  ) {
    account {
      changeName(
        userId: $userId
        newFirstName: $newFirstName
        newLastName: $newLastName
      ) {
        id
        firstName
        lastName
      }
    }
  }
`;
export const CHANGE_PHONE_NUMBER_MUTATION = gql`
  mutation changePhoneNumber($userId: Int!, $newPhoneNumber: String!) {
    account {
      changePhoneNumber(userId: $userId, newPhoneNumber: $newPhoneNumber) {
        id
        phoneNumber
      }
    }
  }
`;
export const CHANGE_TIMEZONE_MUTATION = gql`
  mutation changeTimezone($timezoneName: String!) {
    account {
      changeTimezone(timezoneName: $timezoneName) {
        timezoneName
      }
    }
  }
`;
export const CHANGE_GENDER_MUTATION = gql`
  mutation changeGender($gender: GenderEnum!) {
    account {
      changeGender(gender: $gender) {
        gender
      }
    }
  }
`;
