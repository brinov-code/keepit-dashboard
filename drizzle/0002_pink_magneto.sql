CREATE TABLE `executives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`ativo` enum('sim','não') NOT NULL DEFAULT 'sim',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `executives_id` PRIMARY KEY(`id`),
	CONSTRAINT `executives_nome_unique` UNIQUE(`nome`)
);
