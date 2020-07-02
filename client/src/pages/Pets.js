import React, { useState } from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import PetsList from "../components/PetsList";
import NewPetModal from "../components/NewPetModal";
import Loader from "../components/Loader";

const ALL_PETS = gql`
  query AllPets {
    pets {
      id
      type
      name
      img
    }
  }
`;

const ADD_PET = gql`
  mutation CreatePet($newPet: NewPetInput!) {
    addPet(input: $newPet) {
      id
      type
      name
      img
    }
  }
`;

export default function Pets() {
  const [modal, setModal] = useState(false);
  const allPets = useQuery(ALL_PETS);

  const [createPet, createdPet] = useMutation(ADD_PET, {
    update(cache, { data: { addPet } }) {
      const { pets } = cache.readQuery({ query: ALL_PETS });
      cache.writeQuery({
        query: ALL_PETS,
        data: { pets: [addPet, ...pets] },
      });
    },
  });

  const onSubmit = ({ name, type }) => {
    setModal(false);
    createPet({
      variables: {
        newPet: {
          name,
          type,
        },
      },
    });
  };

  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />;
  }

  if (allPets.loading || createdPet.loading) {
    return <Loader />;
  }

  if (allPets.error || createdPet.error) {
    return <p>Error</p>;
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={allPets.data.pets} />
      </section>
    </div>
  );
}
