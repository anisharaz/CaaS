import json
from sshkey_tools.keys import RsaPrivateKey


def lambda_handler(event, context):
    length = event["length"]
    key = RsaPrivateKey.generate(length)
    res = {
        "private_key": key.to_string(),
        "public_key": key.public_key.to_string(),
    }
    return {"statusCode": 200, "body": json.dumps(res)}
