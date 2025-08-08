import { MultipleSelectList } from "react-native-dropdown-select-list";
import React, { useState, useEffect } from "react";
import { View, Text, Linking, Button } from "react-native";
import { getAuth, updateProfile } from "firebase/auth";
import { db } from "@/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { connect } from "react-redux";

const MultiSelectExampleBare = (props: any) => {
  const [selected, setSelected] = React.useState([]);
  const [list, setList] = useState([]);
  const { formik } = props;

  useEffect(() => {
    if (props.saveTotalUsers) {
      async function fetchData() {
        const post_array: any = [];
        props.saveTotalUsers.forEach((doc: any) => {
          const object = doc;
          const objectver2 = {
            ...object,
            value: `${object.displayNameform}\n(${object.email})`,
            email: object.email,
          };
          post_array.push(objectver2);
        });

        setList(post_array);
      }
      fetchData();
    }
  }, [props.saveTotalUsers]);

  function saveProperty(itemValue: any) {
    formik.setFieldValue("equipoTrabajo", itemValue?.join(","));
  }

  return (
    <>
      <MultipleSelectList
        setSelected={(val: any) => setSelected(val)}
        data={list}
        save="value"
        onSelect={() => saveProperty(selected)}
        label="Categories"
      />
    </>
  );
};

const mapStateToProps = (reducers: any) => {
  return {
    saveTotalUsers: reducers.post.saveTotalUsers,
  };
};

const MultiSelectExample = connect(mapStateToProps, {})(MultiSelectExampleBare);

export default MultiSelectExample;
