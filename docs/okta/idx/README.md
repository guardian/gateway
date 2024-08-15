# Okta IDX API

Status: WIP

_More information about the Okta IDX API will be added soon_

## Hoppscotch Collection

To make working with the Okta IDX API easier, we've added a [Hoppscotch](https://hoppscotch.com/) collection that can be used to make calls directly to the IDX API.

### Setting up the collection + variables

Hoppscotch is a tool which self describes as a took for "developers to build, test and share APIs". It is similar to other tools such as Postman. Except [open source](https://github.com/hoppscotch/hoppscotch).
The collection might also work in other tools, but it's untested.

1. Download the [collection](./okta_idx_hoppscotch_collection.json)
2. In the desktop Hoppscotch app click "Collections" -> "Import/Export" button
3. Click "Import from Hoppscotch" and select the collection file.
4. When imported, a new "Okta IDX" collection should've appeared!

You'll also need an Hoppscotch "Environment" containing the variables/secrets.

A collection pointing to the CODE environment is available on S3. Use the following to download it. Be sure to have the `identity` Janus credentials.

```sh
# this downloads it to your home directory, feel free to change the path if needed e.g. to your downloads folder
$ aws s3 cp --profile identity s3://identity-private-config/DEV/identity-gateway/okta_code_environment_hoppscotch.json ~/okta_code_environment_hoppscotch.json
```

Once downloaded, in Hoppscotch you can:

1. Select "Environments"
2. "Import/Export" button
3. Click "Import from Hoppscotch" and select the environment file.
4. When imported, a new "Okta CODE" environment will have appeared!

Now the "Okta CODE" environment can be selected. You can do this in the top-right under the environments dropdown.

This file already prefills the non-secret and non-changeable variables, called "variables" in Hoppscotch. If these do change, make sure to update the file in s3!

Under the "secrets" tab, these are all things which are either secret, or change frequently. These should be filled in as needed.

### Using the collection

To interface with the Okta IDX API, you always have to make 2 calls in order to begin with.

1. First call the "IDX /interact" endpoint.
   - All the variables/parameters should be set up for this, so just click send!
   - This returns an `interaction_handle` in the body.
   - This will automatically be updated in the variables as `interactionHandle`
2. Next call the "IDX /introspect (with `interactionCode`)" endpoint.
   - This uses the `interactionHandle` from the previous step.
   - This returns a bunch of things, but it's automatically be updated in the variables as `stateHandle`
   - The response includes a `remediation` property which contains an array of possible next steps, this is the same for every IDX API endpoint
   - More information about the IDX API will be added soon.
3. Ready to make further calls!
   - You may need to set up further secrets under environments to make these calls, the ones that you might need to set/update will be highlighted
