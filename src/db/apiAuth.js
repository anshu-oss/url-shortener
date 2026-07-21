import supabase, { supabaseUrl } from "./supabase";

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function signup({ name, email, password, profile_pic }) {
  // 1. Signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw new Error(error.message);

  // 2. Login (required if email confirmation is OFF)
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) throw new Error(loginError.message);

  // 3. Upload profile picture
  if (profile_pic) {
    const fileName = `dp-${Date.now()}-${profile_pic.name}`;

    const { error: storageError } = await supabase.storage
      .from("profile_pic")
      .upload(fileName, profile_pic, {
        upsert: true,
      });

    if (storageError) throw new Error(storageError.message);

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/profile_pic/${fileName}`;

    // 4. Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        name,
        profile_pic: imageUrl,
      },
    });

    if (updateError) throw new Error(updateError.message);
  }

  return data;
}

export async function getCurrentUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw new Error(error.message);

  return session?.user ?? null;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);
}
