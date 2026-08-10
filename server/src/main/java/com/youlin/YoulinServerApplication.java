package com.youlin;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.youlin.mapper")
public class YoulinServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(YoulinServerApplication.class, args);
        System.out.println("\n----------------------------------------------------------");
        System.out.println("\t🚀 友邻 Youlin 社区服务端 (Spring Boot) 启动成功！");
        System.out.println("\t服务接口: http://localhost:8080/api/v1");
        System.out.println("\tH2 控制台: http://localhost:8080/h2-console");
        System.out.println("----------------------------------------------------------\n");
    }

}
