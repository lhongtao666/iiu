linux下调用需要依赖ffmpeg. 安装如下.参考: https://linuxadmin.io/install-ffmpeg-on-centos-7/
yum -y install epel-release
rpm -Uvh http://li.nux.ro/download/nux/dextop/el7/x86_64/nux-dextop-release-0-5.el7.nux.noarch.rpm
yum install ffmpeg ffmpeg-devel -y
ffmpeg -version
