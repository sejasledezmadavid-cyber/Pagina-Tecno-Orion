// supabase-client.js
// Inicializar la conexion con el proyecto

const SUPABASE_URL = "https://kmvjjjwjdvqhddkaxehe.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdmpqandqZHZxaGRka2F4ZWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTM5NTksImV4cCI6MjA5MzQ4OTk1OX0.7rndX8CZta0a7DzZRG3J4bqhax06M8u8g7BKSuVcESs";

var db = null;

if (window.supabase?.createClient) {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
} else {
  console.error("No se cargo la libreria de Supabase.");
}

// 'db' es el objeto que usaremos para todas las consultas
