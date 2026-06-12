use std::env;

fn main() {
    let commit_hash = env::var("GIT_COMMIT_HASH").expect("GIT_COMMIT_HASH is required");
    println!("cargo:rustc-env=GIT_COMMIT_HASH={commit_hash}");
}
