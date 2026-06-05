use std::env;

fn main() {
    let commit_hash = env::var("GIT_COMMIT_HASH").unwrap_or("dev".to_string());
    println!("cargo:rustc-env=GIT_COMMIT_HASH={commit_hash}");
}
