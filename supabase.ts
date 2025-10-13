import { Database } from "@/types/database.types";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseConfig = {};

// First check if we're on server (no window) or client
if (typeof window === "undefined") {
  // Server-side rendering - don't use AsyncStorage
  supabaseConfig = {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
    },
  };
} else {
  // Client-side - now we can use Platform.OS for further customization
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;

  supabaseConfig = {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  };

  // Optional: Add platform-specific configurations
  if (Platform.OS === "ios") {
    // iOS-specific settings if needed
  } else if (Platform.OS === "android") {
    // Android-specific settings if needed
  }
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  supabaseConfig
);

// import { Database } from "@/types/database.types";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { createClient } from "@supabase/supabase-js";
// import "react-native-url-polyfill/auto";

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
// });
