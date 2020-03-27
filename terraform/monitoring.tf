resource "aws_key_pair" "deployer" {
  key_name   = "aws-ecs-monitoring-deployement"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCtJQyTXpaFxsZB4WfIpPyzg66eUdUpPwsGVcs0aPVUvqKCWzeVRauzPjEmljZLdx4fcZNi0RpNzeZMWojdscwNjtRmT09hEYEXxOIvGFCkoilSWJ89pWxsy0m3GvDKymW/haSNMDFTRrgEDUmJifqmxrhUY8roiQ7UPjM2MPF/ePYO/ux6dDbef+H/Hu17z19juV9L+Jm2iYKq5wEftW8ofrbID5jzEcLn0d6wCR3p1Dbb+SbCuAtFfoRFeX9WSV0l09alhXwDokNSsmt8XuN1ofwSS9XzhbyfQO6smBBZDlLIwdLtBGEhU5bb22GpA9BsBOZzmB8VZfpkBofe785f lux@orion"
}

data "template_file" "init_script" {
  template = file("monitoring/instance-setup.sh.tpl")

  vars = {
    aws_access_key_id=data.aws_secretsmanager_secret_version.ragnachat-aws-access-key.secret_string
    aws_secret_access_key=data.aws_secretsmanager_secret_version.ragnachat-aws-secret-access-key.secret_string
    aws_default_region=var.aws_region
    gitlab_password=var.gitlab_password
    cluster_name=aws_ecs_cluster.main.name
    service_name=aws_ecs_service.ragnachatBackendService.name
    prometheus_task_port="9000"
    prometheus_task_path="/metrics"
    prometheus_label_deployment_mode="production"
    target_label_job_name="backend"
    target_file_directory="sd_targets"
    refresh_interval="10"
  }
}

resource "aws_instance" "monitoring-ragnachat-staging" {
  ami           = "ami-035966e8adab4aaad"
  instance_type = "t2.micro"
  key_name = aws_key_pair.deployer.key_name

  root_block_device {
    volume_size = 32
  }

  security_groups = [aws_security_group.admins.id, aws_security_group.monitoring.id]
  subnet_id = aws_subnet.public[0].id

  tags = {
    Name = "Monitoring-ragnachat-staging"
  }

  user_data = data.template_file.init_script.rendered
}
