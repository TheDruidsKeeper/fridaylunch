use FridayLunch;
create table if not exists user(
    user_id int not null auto_increment,
    first_name nvarchar(15),
    last_name nvarchar(20),
    Primary key (user_id)
);

create table if not exists token(
    token_id int not null auto_increment,
    token_type nvarchar(20) not null,
    user_id int not null,
    token nvarchar(255) not null,
    foreign key (user_id)
        references user(user_id)
        on delete cascade,
    Primary key (token_id)
);

create table if not exists location(
    location_id int not null auto_increment,
    location_name nvarchar(25) not null,
    phone nvarchar(15) not null,
    Primary key (location_id)
);

create table if not exists winner(
    winner_id int not null auto_increment,
    user_id int not null,
    location_id int not null,
    participants int not null,
    the_date date,
    foreign key (user_id)
        references user(user_id),
    foreign key (location_id)
        references location(location_id),
    Primary key (winner_id)
);