package ch.samira.tesan.kitcord;


import lombok.Getter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloWorldController {

    @GetMapping("/helloworld")
    public String helloworld(){
        return "Hello World";
    }

    @GetMapping("/helloname")
    public String helloname(@RequestParam(value = "name", defaultValue = "World") String name) {
        return String.format("Hello %s", name);
    }

}
