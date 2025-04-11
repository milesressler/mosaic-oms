Step 1: Install Terraform (if not already installed)
Open your terminal and run:

```shell
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```   
To verify the installation:

```shell
terraform -v
```

If you see a version output, you're good to go!

Step 2: Configure AWS Credentials via SSO:
```
aws configure sso
aws sso login --profile AdministratorAccess-638820400855
```

Amazon will take you through the process, but worth noting that your `~/.aws/config` will include two profiles. One for your user,
and one for the assumed role. Please save the assumed role as the default value, `AdministratorAccess-638820400855`

#### Plan
```
terraform plan
```

#### Review and apply
```
terraform apply
```
