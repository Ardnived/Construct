
define({
	key: 'enforcer',
	move: 1,
	actions: {
		lockdown: "no program may enter or leave an adjacent hex until next sweep.",
		prism: "next time a program enters, lock them down until next sweep.",
	},
});
