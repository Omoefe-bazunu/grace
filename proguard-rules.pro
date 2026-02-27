# Keep Firebase and Play Services classes to prevent crashes during shrinking
-keep class com.google.firebase.** { *; }
-keep class io.invertase.firebase.** { *; }
-keep class com.google.android.gms.** { *; }