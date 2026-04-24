CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa` varchar(255) NOT NULL,
	`totalArr` decimal(10,2) DEFAULT '0',
	`totalQty` int DEFAULT 0,
	`lastSaleDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_empresa_unique` UNIQUE(`empresa`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa` varchar(255) NOT NULL,
	`executivo` varchar(255) NOT NULL,
	`data` timestamp NOT NULL,
	`produto` varchar(255) NOT NULL,
	`tipo` enum('Ativação','Renovação') NOT NULL,
	`qtd` int NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`mensal` decimal(10,2) NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`month` varchar(7) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_key_unique` UNIQUE(`key`)
);
