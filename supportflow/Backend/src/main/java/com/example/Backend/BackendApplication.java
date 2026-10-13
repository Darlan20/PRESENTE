package com.example.Backend;

/**
 * BackendApplication — Classe principal do Spring Boot.
 * Inicia o servidor da API REST na porta 8080.
 */
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
