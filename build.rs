use std::env;

fn main() {
    let profile = env::var("PROFILE").expect("PROFILE should be always set by cargo");

    let commit_hash = match env::var("GIT_COMMIT_HASH") {
        Ok(value) => value,
        Err(_) if profile == "debug" => String::from("dev"),
        Err(_) => panic!("GIT_COMMIT_HASH is required"),
    };

    println!("cargo:rustc-env=GIT_COMMIT_HASH={commit_hash}");
}
