import { useEffect, useState } from 'react';

interface CountdownTimer {
	timeRemaining: number;
	isComplete: boolean;
}

export const useCountdownTimer = (
	durationInSeconds: number,
): CountdownTimer => {
	const [timeRemaining, setTimeRemaining] = useState(durationInSeconds);
	const [isComplete, setIsComplete] = useState(false);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeRemaining((prevTime) => {
				if (prevTime <= 1) {
					clearInterval(timer);
					setIsComplete(true);
					return 0;
				}
				return prevTime - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	return { timeRemaining, isComplete };
};
