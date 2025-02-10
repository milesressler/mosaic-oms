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

Step 2: Configure AWS Credentials:
```
aws configure --profile mosaic-oms
```

#### Plan
```
terraform plan
```

#### Review and apply
```
terraform apply
```
