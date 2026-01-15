"use client";

import { useGetMeQuery } from "@/src/common/api/user.api";

const Profile = () => {
  const { data: me } = useGetMeQuery();
  return <div>Profile</div>;
};

export default Profile;
